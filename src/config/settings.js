/*##############################################################################
# File: settings.js                                                            #
# Project: Anonymice - Discord Bot                                             #
# Author(s): Oliver Renner (@_orenner) & slingn.eth (@slingncrypto)            #
# © 2021                                                                       #
###############################################################################*/

const ZombieCryptABI = require("../contracts/zombiecrypt_abi.json");
const CryptoZombiesABI = require("../contracts/cryptozombies_abi.json");

const settings = {
  rules: [
    // completely customized verification rule
    {
      name: "Crypto Zombies Verifier",
      executor: {
        type: "CryptoZombiesVerificationRule.js",
        config: {
          roles: [
            {
              name: "Zombie Krakenz",
              id: "924727845211734016"
            },
            {
              name: "Zombie Whalez",
              id: "924727788055961673"
            },
            {
              name: "Zombie Orcaz",
              id: "924728098732277790"
            },
            {
              name: "The Hoarde",
              id: "924728162779271209"
            }
          ],
          ZombieCryptContract: {
            Address: "0xe21a40ae500E2e08f82b5E354bF3beF58f5F4A7E",
            ABI: ZombieCryptABI,
          },
          CryptoZombiesContract: {
            Address: "0x5f7BA84c7984Aa5ef329B66E313498F0aEd6d23A",
            ABI: CryptoZombiesABI,
          },
        },
      },
    },
  ],
};

module.exports = settings;
