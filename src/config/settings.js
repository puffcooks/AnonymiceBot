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
              id: "901737568033464321"
            },
            {
              name: "Zombie Whalez",
              id: "901336303587704832"
            },
            {
              name: "Zombie Orcaz",
              id: "900248027682439168"
            },
            {
              name: "The Horde",
              id: "900247379113021460"
            }
          ],
          ZombieCryptContract: {
            Address: "0xe21a40ae500E2e08f82b5E354bF3beF58f5F4A7E",
            ABI: ZombieCryptABI,
          },
          CryptoZombiesContract: {
            Address: "0x2a5AEf99CFa510f8bC57b99E22D97d92483D8053",
            ABI: CryptoZombiesABI,
          },
        },
      },
    },
  ],
};

module.exports = settings;
