const Player = require('../models/Player');
const Injury = require('../models/Injury');

const syncPlayerStatus = async (playerId) => {
  try {
    const activeInjuries = await Injury.find({
      playerId,
      status: { $in: ['injured', 'recovering'] },
    }).sort({ updatedAt: -1 });

    const player = await Player.findById(playerId);
    if (!player) throw new Error('Jucătorul nu a fost găsit.');

    if (activeInjuries.length === 0) {
      player.status = 'notInjured';
    } else {
      const latestInjury = activeInjuries[0];
      player.status = latestInjury.status === 'injured' ? 'injured' : 'recovering';
    }

    await player.save();
  } catch (error) {
    console.error('Eroare la sincronizarea statusului:', error);
    throw error;
  }
};

module.exports = { syncPlayerStatus };