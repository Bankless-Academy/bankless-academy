import i18next from 'i18next'

export const ANIMATIONS = {
  // Bitcoin Basics
  bitcoin: {
    name: i18next.t('Sending a Bitcoin Transaction'),
    type: i18next.t('Animation'),
    description: 'Animation description',
    socialImageLink: null,
    steps: [
      '/animations/bitcoin/step-1.json',
      '/animations/bitcoin/step-2.json',
      '/animations/bitcoin/step-3.json',
      '/animations/bitcoin/step-4.json',
    ],
  },
  // Staking on Ethereum
  'validating-tx-with-ethereum-staking': {
    name: i18next.t('Ethereum Proof-of-Stake consensus'),
    type: i18next.t('Animation'),
    description: 'Validating transactions when staking with Ethereum.',
    socialImageLink: null,
    steps: [
      '/animations/validating-tx-with-ethereum-staking/step-1.json',
      '/animations/validating-tx-with-ethereum-staking/step-2.json',
      '/animations/validating-tx-with-ethereum-staking/step-3.json',
      '/animations/validating-tx-with-ethereum-staking/step-4.json',
      '/animations/validating-tx-with-ethereum-staking/step-5.json',
      '/animations/validating-tx-with-ethereum-staking/step-6.json',
      '/animations/validating-tx-with-ethereum-staking/step-7.json',
    ],
  },
  // Ethereum Basics
  swap: {
    name: i18next.t('Using a dApp'),
    type: i18next.t('Interactive Simulation'),
    description: 'Making a swap on a DEX',
    socialImageLink: null,
    steps: [
      '/animations/swap/step-1.json',
      '/animations/swap/step-2.json',
      '/animations/swap/step-3.json',
      '/animations/swap/step-4.json',
      '/animations/swap/step-5.json',
      '/animations/swap/step-6.json',
    ],
  },
  send: {
    name: i18next.t('Sending a Payment'),
    type: i18next.t('Interactive Simulation'),
    description: 'Sending a Payment',
    socialImageLink: null,
    steps: [
      '/animations/send/step-1.json',
      '/animations/send/step-2.json',
      '/animations/send/step-3.json',
      '/animations/send/step-4.json',
      '/animations/send/step-5.json',
      '/animations/send/step-6.json',
    ],
  },
  ethereum: {
    name: i18next.t('How does sending a payment work on Ethereum?'),
    type: i18next.t('Animation'),
    description: 'How it Works',
    socialImageLink: null,
    steps: [
      '/animations/ethereum/step-1.json',
      '/animations/ethereum/step-2.json',
      '/animations/ethereum/step-3.json',
      '/animations/ethereum/step-4.json',
    ],
  },
}

export const ANIMATION_IDS = Object.keys(ANIMATIONS)
