const logger = require("../utils/logger");
const getProvider = require("../web3/provider");
const { Contract } = require("ethers");
const discordBot = require("../discordBot");

/**
 * Anonymice specific Verification Rule - checks whether users should be assigned Genesis Mice, Baby Mice and
 * Alpha Mice roles based on their holdings. Checks for Mice held in the Users wallet, staked for CHEETH
 * or incubating babies in the breeding process.
 */
class CryptoZombiesVerificationRule {
  constructor(config) {
    this.config = config;
    this.logger = require("../utils/logger");
  }

  async execute(discordUser, role, result) {
    //  note:   this rule is customized to allow for more than one role assignment so we
    //          can ignore the fact that no specific role has been passed in

    let executionResults = [];

    let discordRoles = await this.getDiscordRoles(this.config.roles);

    //wrapping each role we are executing on in its own try/catch
    //if any one fails, others will still be processed

    let totalZombies = result.holding + result.staking;
    let qualifiesForHoarde = totalZombies > 0;
    let qualifiesForOrcaz = totalZombies >= 7;
    let qualifiesForWhalez = totalZombies >= 15;
    let qualifiesForKrakenz = totalZombies >= 50;

    //execute - the hoarde
    try {
      let roleConfig = this.config.roles.find(
        (r) => r.name === "The Hoarde"
      );
      let discordRoleInstance = discordRoles.find(
        (r) => r.id === roleConfig.id
      );
      await this.manageRoles(
        discordUser, // discord user
        discordRoleInstance, //guild instance
        qualifiesForHoarde
      );
      executionResults.push({
        role: "The Hoarde",
        roleId: discordRoleInstance.id,
        qualified: qualifiesForHoarde,
        result: {
          holding: result.holding,
          staking: result.staking
        },
      });
    } catch (err) {
      logger.error(err.message);
      logger.error(err.stack);
    }

    //execute - orcaz
    try {
      let roleConfig = this.config.roles.find(
        (r) => r.name === "Zombie Orcaz"
      );
      let discordRoleInstance = discordRoles.find(
        (r) => r.id === roleConfig.id
      );
      await this.manageRoles(
        discordUser, // discord user
        discordRoleInstance, //guild instance
        qualifiesForOrcaz
      );
      executionResults.push({
        role: "Zombie Orcaz",
        roleId: discordRoleInstance.id,
        qualified: qualifiesForOrcaz,
        result: {
          holding: result.holding,
          staking: result.staking
        },
      });
    } catch (err) {
      logger.error(err.message);
      logger.error(err.stack);
    }


    //execute - whalez
    try {
      let roleConfig = this.config.roles.find(
        (r) => r.name === "Zombie Whalez"
      );
      let discordRoleInstance = discordRoles.find(
        (r) => r.id === roleConfig.id
      );
      await this.manageRoles(
        discordUser, 
        discordRoleInstance, 
        qualifiesForWhalez
      );
      executionResults.push({
        role: "Zombie Whalez",
        roleId: discordRoleInstance.id,
        qualified: qualifiesForWhalez,
        result: {
          holding: result.holding,
          staking: result.staking
        },
      });
    } catch (err) {
      logger.error(err.message);
      logger.error(err.stack);
    }

    //execute - krakenz
    try {
      let roleConfig = this.config.roles.find(
        (r) => r.name === "Zombie Krakenz"
      );
      let discordRoleInstance = discordRoles.find(
        (r) => r.id === roleConfig.id
      );
      await this.manageRoles(
        discordUser, 
        discordRoleInstance, 
        qualifiesForKrakenz
      );
      executionResults.push({
        role: "Zombie Krakenz",
        roleId: discordRoleInstance.id,
        qualified: qualifiesForKrakenz,
        result: {
          holding: result.holding,
          staking: result.staking
        },
      });
    } catch (err) {
      logger.error(err.message);
      logger.error(err.stack);
    }

    return executionResults;
  }

  async check(user) {
    const provider = await getProvider();
    let holdingResult = await this.getHolding(
      this.config.CryptoZombiesContract,
      user,
      provider
    );
    let stakingResult = await this.getStaking(
      this.config.ZombieCryptContract,
      user,
      provider
    );
    

    let result = {
      holding: holdingResult,
      staking: stakingResult
    };
    return result;
  }

  async getDiscordRoles(rolesConfig) {
    let guild = discordBot.getGuild();
    let roles = [];
    //retrieve each of the discord roles defined in the config
    await rolesConfig.forEachAsync(async (r) => {
      let role = await guild.roles.fetch(r.id, { force: true });
      if (!role) {
        logger.error(
          `Could not find the role id configured for ${r.name}. Please confirm your configuration.`
        );
        return;
      }
      roles.push(role);
    });

    return roles;
  }

  async getHolding(config, user, provider) {
    let logMessage = `Crypto Zombies Verification Rule is executing - Get Holding:
Contract:       ${config.Address}
Argument(s):    ${user.walletAddress}`;

    if (!user.walletAddress) {
      logMessage += `
Wallet Address is null/empty. Skipping check against contract and returning 0.`;
      logger.info(logMessage);
      return 0;
    }

    const contract = new Contract(config.Address, config.ABI, provider);

    const result = await contract.balanceOf(user.walletAddress);

    logMessage += `
Result:       ${result}`;
    logger.info(logMessage);

    return result.toNumber(); 
  }

  async getStaking(config, user, provider) {
    let logMessage = `Crypto Zombies Rule is executing - Get Staking:
Contract:       ${config.Address}
Argument(s):    ${user.walletAddress}`;

    if (!user.walletAddress) {
      logMessage += `
Wallet Address is null/empty. Skipping check against contract and returning 0.`;
      logger.info(logMessage);
      return 0;
    }

    const contract = new Contract(config.Address, config.ABI, provider);

    const result = await contract.depositsOf(user.walletAddress);

    logMessage += `
Result:       ${result}`;
    logger.info(logMessage);

    if(!result || result.length <= 0)
      return 0;

    return result.length;
  }


  //todo: cleanup return values arent consumed

  async manageRoles(discordUser, role, qualifies) {
    if (!role) {
      logger.error(
        `Could not locate the ${roleName} discord role using id ${roleId} specified. Please confirm your configuration.`
      );
      return false;
    }

    try {
      if (qualifies) {
        if (!discordUser.roles.cache.has(role.id)) {
          logger.info(`Assigning Role: ${role.name}`);
          await discordUser.roles.add(role);
        }
        return true;
      } else {
        if (discordUser.roles.cache.has(role.id)) {
          logger.info(`Removing Role: ${role.name}`);
          await discordUser.roles.remove(role);
        }
        return false;
      }
    } catch (err) {
      logger.error(err.message);
      logger.error(err.stack)
    }
  }
}

module.exports = CryptoZombiesVerificationRule;
