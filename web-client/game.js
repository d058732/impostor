const protocol = (window.location.protocol === 'https:') ? 'wss' : 'ws'
const baseUrl = `${protocol}://${location.host}/games`
let socket

Vue.component('game', {
    template: `
        <md-app>
            <md-app-toolbar class="md-primary">
                <div class="md-title">Spiel {{gameId}}</div>
            </md-app-toolbar>
            <md-app-content>
                <md-card>
                    <md-card-content>
                        <md-list>
                            <md-list-item v-for="player in players"
                                        :key="player.name">
                                <span class="md-list-item-text" :class="{eliminated: player.isEliminated && isStarted}">
                                    {{player.name}} {{player.name === playerName ? '(Du)' : ''}} [Punkte: {{player.score}}]
                                </span>
                                <md-button v-if="isAdmin && player.isDisconnected" class="md-icon-button md-list-action" @click="kick(player)">
                                    <md-icon class="md-primary md-accent">link_off</md-icon>
                                </md-button>
                                <md-button v-if="isAdmin && isStarted && !player.isEliminated"
                                        class="md-icon-button md-list-action"
                                        @click="vote(player)">
                                    <md-icon class="md-primary">eject</md-icon>
                                </md-button>
                            </md-list-item>
                        </md-list>
                    </md-card-content>

                    <md-card-actions v-if="isAdmin">
                        <md-button v-if="players.length > 2" @click="start" class="md-raised md-primary">
                            Neue Runde
                        </md-button>
                    </md-card-actions>
                </md-card>

                <md-card v-if="isStarted">
                    <md-card-header>
                        <div class="md-title">Wort: {{word}}</div>
                    </md-card-header>
                    <md-card-content v-if="winners.length > 0">
                        Spiel vorbei. Gewinner: {{winners.join(', ')}}.
                    </md-card-content>
                </md-card>    
            </md-app-content>
        </md-app>
    `,
    props: ['playerName', 'gameId'],
    data: function () {
        return {
            isAdmin: false,
            players: [],
            word: '',
            winners: []
        }
    },
    computed: {
        isStarted: function () {
            return (this.word !== '') && (this.players.length > 2)
        }
    },
    created: function () {
        // REVISE feels a bit awkward - check if it is cleaner using socket.onclose
        window.addEventListener('focus', () => {
            if (socket && (socket.readyState === WebSocket.CLOSED)) {
                this.join()
            }
        })
    },
    methods: {
        connect: function () {
            return new Promise((resolve) => {
                socket = new WebSocket(`${baseUrl}/${this.gameId}`)
                socket.onmessage = (event) => {
                    const data = JSON.parse(event.data)
                    this.isAdmin = data.isAdmin
                    this.players = data.players
                    this.players.sort((playerA, playerB) => playerB.score - playerA.score)
                    this.word = data.word
                    this.winners = data.winners
                }
                socket.onopen = () => {
                    resolve()
                }
            })
        },
        join: async function () {
            await this.connect()
            socket.send(JSON.stringify({ command: 'join', playerName: this.playerName }))
        },
        kick: function (player) {
            socket.send(JSON.stringify({ command: 'kick', playerName: player.name }))
        },
        vote: function (player) {
            socket.send(JSON.stringify({ command: 'vote', playerName: player.name }))
        },
        start: function () {
            socket.send(JSON.stringify({ command: 'start' }))
        }
    }
})
