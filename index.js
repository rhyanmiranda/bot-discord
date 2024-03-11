import { config } from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js'
import { google } from 'googleapis'
import { schedule } from 'node-cron'

config(); // configuration .ENV

const discordClient = new Client({
  intents: [
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds
  ]
})

const youtubeClient = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
})

let latestVideoId = ''

// logando no servidor passando o token para se autenticar
discordClient.login(process.env.DISCORD_TOKEN) 

// deixando o bot online
discordClient.on('ready', () => {
  console.log(`Bot online, logado como: ${discordClient.user.tag}`)
  checkNewVideos()
  // a cada uma hora a função é chamada 
  schedule("* * 0 * * *", checkNewVideos)
})

//criando função que vai bater na API do YouTube
async function checkNewVideos() {
  try {
    // vai retornar o video mais recente
    const response = await youtubeClient.search.list({
      channelId: 'UCpKvMmsF6QrkVr_zWaLGK-A', 
      order: 'date', // ordenado
      part: 'snippet',
      type: 'video', // somente videos
      maxResults: 1
    }).then(res => res)
    const latestVideo = response.data.items[0]

    if(latestVideo?.id?.videoId != latestVideoId){
      latestVideoId = latestVideo?.id?.videoId
      const videoUrl = `https://www.youtube.com/watch?v=${latestVideoId}`
      const message = 'Confira o ultimo vídeo do canal !!'
      const channel = discordClient.channels.cache.get('1216718914889977927')
      // envia a mensagem no discord
      channel.send(`${message}
      ${videoUrl}`)
    }
  } catch (error) {
    console.log('Erro ao buscar ultimo video do canal' + error)
  }
}