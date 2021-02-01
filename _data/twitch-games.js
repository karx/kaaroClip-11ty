const {ApiClient} = require("twitch");
const {StaticAuthProvider} = require('twitch-auth');

const clientId = process.env.Twitch_ClientID;
const accessToken = process.env.Twitch_Auth;

const authProvider = new StaticAuthProvider(clientId, accessToken);
const apiClient = new ApiClient({ authProvider });


module.exports = async () => {
    return apiClient.helix.games.getTopGames().then(async function(response) {

        const games = await Promise.all( response.data.map( async (g) => {
            let streams = await g.getStreams();
            // console.log(streams.data);
            return {
                id: g.id,
                name: g.name,
                url: g.boxArtUrl.replace('{width}', '480').replace('{height}', '320'),
                streams: streams.data.map( (x) => {
                    return {
                        gameid: x.gameId,
                        id: x.id,
                        thumbnailUrl: x.thumbnailUrl.replace('{width}', '480').replace('{height}', '320'),
                        title: x.title,
                        userDisplayName: x.userDisplayName
                    }
                }),
                clips: await getClipsOfGame(g.id)
            }
        }));
        // console.log(games);
        return games;

    })
    .catch(console.error)

};


async function getStreamsOfGame(gameId) {

}

async function getClipsOfGame(gameId) {
    console.log(gameId);
    let clips = await apiClient.helix.clips.getClipsForGame(gameId);
    let toReturn = clips.data.map( (x) => {
        x.videoURL = x.thumbnailUrl.replace('-preview-480x272.jpg', '.mp4');
        return x; 
    });
    console.log(toReturn);
    return toReturn;
}