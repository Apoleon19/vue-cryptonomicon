<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700">Тикер</label>
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            type="text"
            name="wallet"
            id="wallet"
            class="
              block
              w-full
              pr-10
              border-gray-300
              text-gray-900
              focus:outline-none focus:ring-gray-500 focus:border-gray-500
              sm:text-sm
              rounded-md
            "
            v-model.trim="ticker"
            @keydown.enter="addTicker(ticker)"
            placeholder="Например DOGE"
            autocomplete="off"
          />
        </div>
        <div v-if="ticker && suggestedTickers.length" class="flex bg-white shadow-md p-1 rounded-md flex-wrap">
          <span
            v-for="suggest in suggestedTickers"
            :key="suggest.name"
            @click="addTicker(suggest.name)"
            class="
              inline-flex
              items-center
              px-2
              m-1
              rounded-md
              text-xs
              font-medium
              bg-gray-300
              text-gray-800
              cursor-pointer
            "
          >
            {{ suggest.name }}
          </span>
        </div>
        <div v-if="tickerExists" class="text-sm text-red-600">Такой тикер уже добавлен</div>
      </div>
    </div>
    <add-button @click="addTicker(ticker)" />
  </section>
</template>
<script>
import { loadSuggestTickers } from '../api'
import AddButton from './AddButton.vue'

export default {
  components: { AddButton },
  props: {
    tickers: { type: Array, required: true }
  },
  emits: {
    'add-ticker': (value) => typeof value === 'object'
  },
  data() {
    return { ticker: '', suggestTickers: [] }
  },
  async created() {
    await this.updateSuggestTickers()
  },
  methods: {
    async updateSuggestTickers() {
      const suggestData = await loadSuggestTickers()
      this.suggestTickers = suggestData
    },
    addTicker(ticker) {
      if (!this.ticker || this.checkTickerExists(ticker)) return
      const currentTicker = { name: this.ticker.toUpperCase(), price: 0 }
      this.$emit('add-ticker', currentTicker)
      this.ticker = ''
    },
    checkTickerExists(ticker) {
      this.ticker = ticker
      return this.tickers.find((e) => e.name == ticker.toUpperCase())
    }
  },
  computed: {
    suggestedTickers() {
      return this.suggestTickers
        .filter((suggest) => {
          return suggest.fullname.toLowerCase().includes(this.ticker.toLowerCase())
        })
        .slice(0, 4)
    },
    tickerExists() {
      return this.checkTickerExists(this.ticker)
    }
  }
}
</script>
