import { connectToDatabase } from './_db.js'

const TOTAL_50_HOURS_SECONDS = 50 * 3600 // 180,000 seconds

// In-memory fallback if MongoDB is not connected
if (!global.__MEDAITHON_TIMER_FALLBACK__) {
  const fallbackStart = process.env.MEDAITHON_START_TIME
    ? new Date(process.env.MEDAITHON_START_TIME).getTime()
    : Date.now()
  const fallbackEnd = process.env.MEDAITHON_TARGET_END_TIME
    ? new Date(process.env.MEDAITHON_TARGET_END_TIME).getTime()
    : fallbackStart + TOTAL_50_HOURS_SECONDS * 1000

  global.__MEDAITHON_TIMER_FALLBACK__ = {
    totalSeconds: TOTAL_50_HOURS_SECONDS,
    startTime: fallbackStart,
    targetEndTime: fallbackEnd,
    isRunning: true,
    pausedRemainingSeconds: null,
    updatedAt: Date.now(),
  }
}

export default async function handler(req, res) {
  // CORS & Cache-Control headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const { db } = await connectToDatabase()
    const collection = db ? db.collection('timer_state') : null

    // Helper to get active timer state
    async function getTimerDoc() {
      if (collection) {
        let doc = await collection.findOne({ _id: 'medaithon_50h_timer' })
        if (!doc) {
          const startTime = process.env.MEDAITHON_START_TIME
            ? new Date(process.env.MEDAITHON_START_TIME).getTime()
            : Date.now()
          const targetEndTime = process.env.MEDAITHON_TARGET_END_TIME
            ? new Date(process.env.MEDAITHON_TARGET_END_TIME).getTime()
            : startTime + TOTAL_50_HOURS_SECONDS * 1000

          doc = {
            _id: 'medaithon_50h_timer',
            totalSeconds: TOTAL_50_HOURS_SECONDS,
            startTime,
            targetEndTime,
            isRunning: true,
            pausedRemainingSeconds: null,
            updatedAt: Date.now(),
          }

          try {
            await collection.insertOne(doc)
          } catch {
            // Already created by another concurrent request
            doc = await collection.findOne({ _id: 'medaithon_50h_timer' })
          }
        }
        return doc
      }
      return global.__MEDAITHON_TIMER_FALLBACK__
    }

    // Helper to update timer state
    async function updateTimerDoc(updates) {
      updates.updatedAt = Date.now()
      if (collection) {
        await collection.updateOne(
          { _id: 'medaithon_50h_timer' },
          { $set: updates },
          { upsert: true }
        )
      }
      global.__MEDAITHON_TIMER_FALLBACK__ = {
        ...global.__MEDAITHON_TIMER_FALLBACK__,
        ...updates,
      }
      return await getTimerDoc()
    }

    if (req.method === 'GET') {
      const doc = await getTimerDoc()
      const now = Date.now()
      let remainingSeconds = 0

      if (doc.isRunning) {
        remainingSeconds = Math.max(0, Math.floor((doc.targetEndTime - now) / 1000))
        if (remainingSeconds === 0 && doc.isRunning) {
          await updateTimerDoc({ isRunning: false, pausedRemainingSeconds: 0 })
        }
      } else {
        remainingSeconds = doc.pausedRemainingSeconds !== null && doc.pausedRemainingSeconds !== undefined
          ? doc.pausedRemainingSeconds
          : Math.max(0, Math.floor((doc.targetEndTime - (doc.updatedAt || now)) / 1000))
      }

      return res.status(200).json({
        success: true,
        startTime: doc.startTime,
        targetEndTime: doc.targetEndTime,
        totalSeconds: doc.totalSeconds || TOTAL_50_HOURS_SECONDS,
        isRunning: doc.isRunning,
        remainingSeconds,
        serverTime: now,
        storage: collection ? 'mongodb' : 'memory_fallback',
      })
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
      const { action } = body
      const doc = await getTimerDoc()
      const now = Date.now()

      if (action === 'pause') {
        const remaining = Math.max(0, Math.floor((doc.targetEndTime - now) / 1000))
        const updated = await updateTimerDoc({
          isRunning: false,
          pausedRemainingSeconds: remaining,
        })
        return res.status(200).json({
          success: true,
          ...updated,
          remainingSeconds: remaining,
          serverTime: now,
        })
      }

      if (action === 'resume') {
        const remaining = doc.pausedRemainingSeconds !== null && doc.pausedRemainingSeconds !== undefined
          ? doc.pausedRemainingSeconds
          : Math.max(0, Math.floor((doc.targetEndTime - now) / 1000))

        const newTargetEndTime = now + (remaining * 1000)
        const updated = await updateTimerDoc({
          isRunning: true,
          targetEndTime: newTargetEndTime,
          pausedRemainingSeconds: null,
        })
        return res.status(200).json({
          success: true,
          ...updated,
          remainingSeconds: remaining,
          serverTime: now,
        })
      }

      if (action === 'reset') {
        const totalSecs = body.totalSeconds || TOTAL_50_HOURS_SECONDS
        const newTargetEndTime = now + (totalSecs * 1000)
        const updated = await updateTimerDoc({
          startTime: now,
          targetEndTime: newTargetEndTime,
          totalSeconds: totalSecs,
          isRunning: true,
          pausedRemainingSeconds: null,
        })
        return res.status(200).json({
          success: true,
          ...updated,
          remainingSeconds: totalSecs,
          serverTime: now,
        })
      }

      if (action === 'adjust') {
        const deltaSeconds = parseInt(body.deltaSeconds, 10) || 0
        let newTargetEndTime = doc.targetEndTime
        let newPaused = doc.pausedRemainingSeconds

        if (doc.isRunning) {
          newTargetEndTime = doc.targetEndTime + (deltaSeconds * 1000)
        } else {
          newPaused = Math.max(0, (doc.pausedRemainingSeconds || 0) + deltaSeconds)
          newTargetEndTime = now + (newPaused * 1000)
        }

        const updated = await updateTimerDoc({
          targetEndTime: newTargetEndTime,
          pausedRemainingSeconds: newPaused,
        })

        const remaining = doc.isRunning
          ? Math.max(0, Math.floor((newTargetEndTime - now) / 1000))
          : newPaused

        return res.status(200).json({
          success: true,
          ...updated,
          remainingSeconds: remaining,
          serverTime: now,
        })
      }

      return res.status(400).json({ success: false, error: 'Unknown action' })
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' })
  } catch (error) {
    console.error('Timer API Error:', error)
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    })
  }
}
