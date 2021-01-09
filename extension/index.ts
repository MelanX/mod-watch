import { NodeCG } from "nodecg/types/server";
import { TwitchServiceClient } from "nodecg-io-twitch/extension";
import { requireService } from "nodecg-io-core/extension/serviceClientWrapper";
import * as fs from "fs";

// YOU SHOULD EDIT THIS!
const bots = ["bot702", "streamelements", "nvidiageforcede", "nightbot"];
const twitchChannel = "#skate702";
// Stop here.

module.exports = function(nodecg: NodeCG) {
    nodecg.log.info("mod-watch started");

    const twitch = requireService<TwitchServiceClient>(nodecg, "twitch-chat");

    twitch?.onAvailable((client) => {
        client.getNativeClient().join(twitchChannel).then(() => {
            nodecg.log.info(`Connected to twitch channel ${twitchChannel.replace("#", "")}`);
            client.getNativeClient().onPrivmsg((channel, user, message, messageData) => {
                if (channel === twitchChannel) {
                    const twitchUser = messageData.userInfo;
                    if (message === "!mod-watch data" && twitchUser.isBroadcaster) {
                        const file = fs.readFileSync(__dirname + "/data/data.json");
                        client.getNativeClient().whisper(user, file.toString());
                    } else if (twitchUser.isMod && !bots.includes(user)) {
                        const file = fs.readFileSync(__dirname + "/data/data.json");
                        const data = JSON.parse(file.toString());
                        const date = new Date(Date.now());
                        data[user] = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
                        fs.writeFileSync(__dirname + "/data/data.json", JSON.stringify(data));
                    }
                }
            });
        });
    });
};
