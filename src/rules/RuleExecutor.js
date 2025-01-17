require("../utils/arrays");
const config = require("../config");
const fs = require("fs");
const path = require("path");
const settings = require("../config/settings");
const logger = require("../utils/logger");
const DiscordBot = require("../discordBot");

class RuleExecutor {
  constructor() {
    this.rules = [];
    settings.rules.forEach((rule) => {
      let executorType = require(path.join(__dirname, rule.executor.type));
      let executor = new executorType(rule.executor.config);
      this.rules.push({
        name: rule.name,
        roleId: rule.roleId,
        executor: executor,
      });
    });
  }

  async run(user) {
    if (!user || !user.userId)
      throw Error(
        `RuleExecutor.run requires a user with a userId, received: ${user}`
      );

    // retrieve the discord user
    const guild = DiscordBot.getGuild(config.discord.guildId);
    const discordUser = await guild.members.fetch(user.userId, {force: true});

    if(!discordUser || !discordUser.roles)
        throw Error(`RuleExecutor.run could not fetch the specific`)

    // Check once
    const result = await this.rules[0].executor.check(user);
    console.log('result', result)
    await this.rules.forEachAsync(async (rule) => {
      rule.result = result;
    });

    //retrieve users full list of roles for logging
    const discordUserCurrentRoles = [];
    discordUser.roles.cache.forEach((r) => {
      discordUserCurrentRoles.push(r.name);
    });

    let logMessage = `Synchronizing roles for user: 
Discord:  ${discordUser.displayName} (${discordUser.nickname}) 
Wallet:   ${user.walletAddress}
Roles:    ${discordUserCurrentRoles}
-------------------------------------------------------------------------------`;
    logger.info(logMessage);

    let results = [];
    await this.rules.forEachAsync(async (rule) => {
      try {
        let role = await guild.roles.fetch(rule.roleId, {force: true});

        //if the configuration has a role id, we expect that should resolve to a discord role
        //otherwise we will assume the verification rule is custom and will figure out the
        //roles it needs to deal with internally
        if (rule.roleId && !role) {
          logger.info(
            "Role not found, please make sure to use the correct role id."
          );
          return;
        }

        let executionResult = await rule.executor.execute(
          discordUser,
          role,
          rule.result
        );

        if (Array.isArray(executionResult)) {
          results.push(...executionResult);
        } else {
          results.push(executionResult);
        }
      } catch (err) {
        logger.error(err.message);
        logger.error(err.stack);
      }
    });

    let discordUserFinalRoles = [];
    discordUser.fetch(true);
    discordUser.roles.cache.forEach((r) => {
      discordUserFinalRoles.push(r.name);
    });
    logMessage += `
Final Roles: ${discordUserFinalRoles}
-------------------------------------------------------------------------------
    `;
    logger.info(logMessage);
    return results;
  }
}

module.exports = new RuleExecutor();
