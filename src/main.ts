import {createApp} from 'vue'
import './stype/style.css'
import App from './App.vue'
import 'vuetify/styles'
import {createVuetify} from 'vuetify'
import {setLogLevel} from './utils/Logger'

const vuetify = createVuetify({
    ssr: true,
    icons: {
        defaultSet: 'mdi',
    },
})
createApp(App)
    .use(vuetify)
    .mount(
        (() => {
            setLogLevel('debug')
            const app = document.createElement('div')
            app.id = 'ci-helper'
            document.body.append(app)
            return app
        })(),
    )
