import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import token from "../config.json" assert { type: "json" };
import idToDate from "../funcs.js"
import FLAGS from "../flags.js"


const app = express();

app.get("/", (req, res) => {
    res.send("welcome! endpoints: /api/v1/guild/:id\n/api/v1/user/:id\n/api/v1/bot/:id")
});


app.get("/api/v1/user/:id/", async function(req,res){
    let id = req.params.id;

    try {
        const response = await fetch(`https://canary.discord.com/api/v10/users/${id}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bot ${token.token}`,
            },
        });

        const json = await response.json();
        if (json.message) return res.status(404).send(json);

        const availableBannerFileTypes = [".png",".jpg",".gif"]

        let bannerUrl = null;
        let avatarUrl = null;

        if (json.banner) {
            bannerUrl = `https://cdn.discordapp.com/banners/${json.id}/${json.banner}.png?size=1024`
        }

        if (json.avatar) {
            avatarUrl = `https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}.png?size=1024`
        }

        let flagsFromUser = [];

        FLAGS.forEach((flag) => {
            if (json.public_flags & flag.bitwise) flagsFromUser.push(flag.flag)
        });

        // console.log(json.public_flags)

        // console.log(pubFlags)

        var createdAt = idToDate(json.id)

        let output = {
           username: json.username,
           account_created: createdAt.toString().replace("T", "").replace("Z", ""),
           id: json.id,
           badges: pubFlags,
           discriminator: json.discriminator,
           display_name: json.global_name,
           nitro: json.premium_type,
           accent: json.accent_color,
           media: {
            avatar: {
                avatar: json.avatar,
                avatar_url: avatarUrl,
               },
               banner: {
                id: json.banner,
                url: bannerUrl,
               },
           },
           clan: {
            clan_tag: json.clan && json.clan.tag ? json.clan.tag : null,
            guild_id: json.clan && json.clan.identity_guild_id ? json.clan.identity_guild_id : null
           }
        }

        res.send(output);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Internal Server Error" });
    }
});
app.get("/api/v1/bot/:id/", async function(req,res){
    let id = req.params.id;

    try {
        const response = await fetch(`https://canary.discord.com/api/v10/applications/${id}/rpc`);
        const json = await response.json();
        if (json.message) return res.status(404).send(json);



        let output = {
            bot_id: json.id,
            bot_name: json.name,
            description: json.description,
            bot_verified: json.is_verified,
            bot_flags: json.flags,
            key: json.verify_key,
            public: json.bot_public
        }
        res.send(output);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

app.get("/api/v1/guild/:id/", async function(req, res) {
    let id = req.params.id;

    try {
        const response = await fetch(`https://canary.discord.com/api/v10/guilds/${id}/widget.json`, {
            headers: {
                "Content-Type": "application/json",
            }
        });

        const json = await response.json();
        if (json.code === 50004) {
            return res.status(404).send({
                error_code: "50004", error: "Guild is non-existent, or not on discovery page!"
            });
        }

        let output = {
            guild_id: json.id,
            guild_name: json.name,
            presence_count: json.presence_count,
            instant_invite: json.instant_invite
        }
        res.send(output)
    } catch (e) {
        console.error(e);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

app.listen(1337, "127.0.0.1");
console.log(`server opened`);
