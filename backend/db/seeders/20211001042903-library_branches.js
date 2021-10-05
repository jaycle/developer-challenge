'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    await queryInterface.bulkInsert('LibraryBranches', [
      {
        name: 'Durham County',
        accountAddress: '0xab29844de56cffcb4005a60bf514f88135e83808',
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Wake County',
        accountAddress: '0x570867a29dae5bc845962c8a94d79cf580a7cd96',
        createdAt: now,
        updatedAt: now
      }
    ])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete(
      'LibraryBranches',
      {[Sequelize.Op.or]: [
        { accountAddress: '0xab29844de56cffcb4005a60bf514f88135e83808' },
        { accountAddress: '0x570867a29dae5bc845962c8a94d79cf580a7cd96' }
      ]},
      {}
    );
  }
};
