<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <page-loader v-if="loading" />
    <div v-else class="container">
      <add-ticker :tickers="tickers" @add-ticker="addNewTicker" />
      <section>
        <hr class="w-full border-t border-gray-600 my-4" />
        <div>
          <label for="filter" class="block text-lx font-medium text-gray-700">Фильтр</label>
          <input
            v-model="filter"
            id="filter"
            type="text"
            class="
              block
              w-full
              pr-10
              mt-2
              border-gray-300
              text-gray-900
              focus:outline-none focus:ring-gray-500 focus:border-gray-500
              sm:text-sm
              rounded-md
            "
            placeholder="Введите название тикера"
          />
        </div>
        <button
          v-if="page > 1"
          @click="page = page - 1"
          type="button"
          class="
            mr-2
            my-4
            inline-flex
            items-center
            py-2
            px-4
            border border-transparent
            shadow-sm
            text-sm
            leading-4
            font-medium
            rounded-full
            text-white
            bg-gray-600
            hover:bg-gray-700
            transition-colors
            duration-300
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
          "
        >
          Назад
        </button>
        <button
          v-if="hasNextPage"
          type="button"
          @click="page += 1"
          class="
            my-4
            inline-flex
            items-center
            py-2
            px-4
            border border-transparent
            shadow-sm
            text-sm
            leading-4
            font-medium
            rounded-full
            text-white
            bg-gray-600
            hover:bg-gray-700
            transition-colors
            duration-300
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
          "
        >
          Вперед
        </button>
      </section>

      <template v-if="tickers.length">
        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <ticker-card
            v-for="ticker in tickersPage"
            :key="ticker.name"
            :ticker="ticker"
            :isSelected="ticker == selectedTicker"
            @select-ticker="selectedTicker = $event"
            @remove-ticker="removeTicker"
          />
        </dl>
      </template>
      <ticker-graph :graph="graph" :ticker="selectedTicker" @close-graph="selectedTicker = null" />
    </div>
  </div>
</template>
<script>
import { subscribeToTicker, unsubscribeFromTicker } from '@/api.js'
import AddTicker from './components/AddTicker.vue'
import TickerCard from './components/TickerCard.vue'
import TickerGraph from './components/TickerGraph.vue'
import PageLoader from './components/PageLoader.vue'

export default {
  components: { AddTicker, TickerCard, TickerGraph, PageLoader },
  name: 'App',
  data() {
    return {
      loading: true,
      filter: '',

      tickers: [],
      selectedTicker: null,

      graph: [],
      maxGraphElements: 1,

      page: 1
    }
  },
  setup() {
    return {
      maxTickersPerPage: 6
    }
  },
  async created() {
    const windowData = Object.fromEntries(new URL(window.location).searchParams.entries())
    if (windowData.filter) this.filter = windowData.filter
    if (windowData.page) this.page = parseInt(windowData.page)

    this.tickers = JSON.parse(localStorage.getItem('cryptonomicon-tickers')) || []
    this.tickers.forEach((ticker) => {
      subscribeToTicker(ticker.name, this.updateTicker)
    })

    this.loading = false
  },
  mounted() {
    window.addEventListener('resize', this.calculateMaxGraphElements)
  },

  methods: {
    addNewTicker(ticker) {
      this.tickers = [ticker, ...this.tickers]
      subscribeToTicker(ticker.name, this.updateTicker)
    },
    updateTicker(tickerName, price, hasError) {
      this.tickers
        .filter((t) => t.name == tickerName)
        .forEach((t) => {
          if (t === this.selectedTicker) {
            this.graph.push(price)
            this.calculateGraphElementsToDisplay()
          }
          t.price = price
          t.error = Boolean(hasError)
        })
    },
    calculateMaxGraphElements() {
      if (!this.$refs.graph) return
      this.maxGraphElements = Math.round(this.$refs.graph.clientWidth / this.graphElementWidth)
      this.calculateGraphElementsToDisplay()
    },
    calculateGraphElementsToDisplay() {
      if (this.graph.length < this.maxGraphElements) return
      this.graph = this.graph.splice(this.graph.length - this.maxGraphElements)
    },
    removeTicker(ticker) {
      this.tickers = this.tickers.filter((e) => e != ticker)
      unsubscribeFromTicker(ticker.name, this.updateTicker)
      if (ticker == this.selectedTicker) this.selectedTicker = null
    }
  },
  computed: {
    filteredTickers() {
      return this.tickers.filter((ticker) => ticker.name.toLowerCase().includes(this.filter.toLowerCase()))
    },
    tickersPage() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex)
    },
    startIndex() {
      return (this.page - 1) * this.maxTickersPerPage
    },
    endIndex() {
      return this.page * this.maxTickersPerPage
    },
    hasNextPage() {
      return this.filteredTickers.length > this.endIndex
    },

    pageStateOptions() {
      return {
        page: this.page,
        filter: this.filter
      }
    }
  },
  watch: {
    ticker() {
      if (this.tickerExist) this.tickerExist = false
    },
    tickersPage() {
      if (this.tickersPage.length === 0 && this.filteredTickers.length) this.page -= 1
    },
    selectedTicker() {
      this.graph = []
      this.$nextTick().then(this.calculateMaxGraphElements)
    },
    tickers() {
      localStorage.setItem('cryptonomicon-tickers', JSON.stringify(this.tickers))
    },
    pageStateOptions() {
      window.history.pushState(
        null,
        document.title,
        `${window.location.pathname}?filter=${this.pageStateOptions.filter}&page=${this.pageStateOptions.page}`
      )
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.calculateMaxGraphElements)
  }
}
</script>
