const Alert = require('../model/Alert');

exports.getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.findByUserId(req.user.id);
    res.json(alerts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
};

exports.createAlert = async (req, res) => {
  try {
    const alert = await Alert.create(req.user.id, req.body);
    res.status(201).json(alert);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
};

exports.updateAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const alert = await Alert.update(id, req.body);
    res.json(alert);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update alert' });
  }
};

exports.deleteAlert = async (req, res) => {
  try {
    const { id } = req.params;
    await Alert.delete(id);
    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete alert' });
  }
}; 