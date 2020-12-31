Vue.component('login', {
    template: `
        <md-app>
            <md-app-toolbar class="md-primary">
                <div class="md-title">Spiel beitreten oder erstellen</div>
            </md-app-toolbar>
            <md-app-content>
                <form v-if="!hasJoined">
                    <md-field>
                        <label>Dein Name</label>
                        <md-input v-model="playerName" maxlength="16" required></md-input>
                        <md-button v-if="playerName.length > 0"
                                @click="createGame" class="md-raised md-primary">Neues Spiel erstellen</md-button>
                    </md-field>

                    <md-field>
                        <label>Spiel</label>
                        <md-input v-model="gameId" maxlength="6"></md-input>
                        <md-button v-if="(playerName.length > 0) && (gameId.length===6)" 
                                @click="join" class="md-raised md-primary">Beitreten</md-button>
                    </md-field>
                </form>
                <game v-if="hasJoined" :gameId="gameId" :playerName:"playerName" />
            </md-app-content>
        </md-app>
    `,
    data: function () {
        return { playerName: '', gameId: '', hasJoined: false }
    },
    methods: {
        createGame: async function () {
            const response = await fetch('/games', { method: 'POST' })
            this.gameId = response.headers.get('location')
            this.join()
        },
        join: async function () {
            this.hasJoined = true
        }
    }
})
