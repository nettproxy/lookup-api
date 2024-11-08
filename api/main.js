import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import token from "../config.json" assert { type: "json" };
import idToDate from "../funcs.js"


const app = express();

app.get("/", (req, res) => {
    res.send("welcome! endpoints: /api/v1/guild/:id\n/api/v1/user/:id\n/api/v1/bot/:id")
});


app.get("/api/v1/user/:id/", function(req,res){
    let id = req.params.id;

    try {
        fetch(`https://canary.discord.com/api/v10/users/${id}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bot ${token.token}`,
            },
        })
        .then((res) => res.json())
        .then((json) => {
            if (json.message) return res.send(json);

            const availableBannerFileTypes = [".png",".jpg",".gif"]

            let bannerUrl = null;
            let avatarUrl = null;

            if (json.banner) {
                bannerUrl = `https://cdn.discordapp.com/banners/${json.id}/${json.banner}.png?size=1024`
            }

            if (json.avatar) {
                avatarUrl = `https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}.png?size=1024`
            }

            var createdAt = idToDate(json.id)

            let output = {
               username: json.username,
               account_created: createdAt.toString().replace("T", "").replace("Z", ""),
               id: json.id,
               discriminator: json.discriminator,
               display_name: json.global_name,
               accent: json.accent_color,
               avatar: {
                avatar: json.avatar,
                avatar_url: avatarUrl,
               },
               banner: {
                id: json.banner,
                url: bannerUrl,
               }
            }

            res.send(output);
        });
    } catch (err) {
        console.log(err);
    }
});
app.get("/api/v1/bot/:id/", function(req,res){
    let id = req.params.id;

    try {
        fetch(`https://canary.discord.com/api/v10/applications/${id}/rpc`, {
        })
        .then((res) => res.json())
        .then((json) => {
            if (json.message) return res.send(json);



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
        });
    } catch (err) {
        console.log(err);
    }
});

app.get("/api/v1/guild/:id/", function(req, res) {
    let id = req.params.id;

    try {
        fetch(`https://canary.discord.com/api/v10/guilds/${id}/widget.json`, {
            headers: {
                "Content-Type": "application/json",
            }
        })
        .then((res) => res.json())
        .then((json) => {
            if (json.code && json.code === 500004) {
                res.send({
                    error: "Guild is non-existent, or not on discovery"
                })
                return;
            }

            let output = {
                guild_id: json.id,
                guild_name: json.name,
                presence_count: json.presence_count,
                instant_invite: json.instant_invite
            }
            res.send(output)
        })
    } catch (e) {
        res.send(e)
        return res.status(500)
    }
});

app.listen(1337, "127.0.0.1");
console.log(`server opened`);
