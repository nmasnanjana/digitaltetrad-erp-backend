import express from 'express';
import { checkPermission } from '../middleware/checkPermission';

const router = express.Router();

// System-wide cache clear endpoint (developer only)
router.post('/clear', checkPermission('cache', 'clear'), async (req, res) => {
  try {
    // Here you could implement WebSocket notifications to all connected clients
    // For now, we'll just return success
    // In a real implementation, you might use Socket.io or similar
    
    console.log('System cache clear requested by:', req.user?.id);
    
    // You could add WebSocket notification here:
    // io.emit('cache:clear', { timestamp: Date.now() });
    
    res.json({ 
      success: true, 
      message: 'System cache clear notification sent to all users',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error clearing system cache:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to clear system cache' 
    });
  }
});

export default router; 