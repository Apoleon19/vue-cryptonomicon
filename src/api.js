const API_KEY = '5ce0b83a3cd367f4805d7cde091fadfd4ef6a58b6d3b850f90ecf9cce52bc63b'
const AGGREGATE_INDEX = '5'
const ERROR_SUB_CODE = '500'
const BTC_TICKER = 'BTC'
let LAST_BTC_PRICE = 0
const messages = { invalidSub: 'INVALID_SUB' }

const tickersHandlers = new Map()
const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`)

socket.addEventListener('message', (e) => {
  const {
    TYPE: type,
    MESSAGE: message,
    FROMSYMBOL: currency,
    PRICE: newPrice,
    PARAMETER: tickerSub
  } = JSON.parse(e.data)

  if (type === ERROR_SUB_CODE && message === messages.invalidSub) {
    const [currency, target] = tickerSub.split('~').slice(2)
    if (target === BTC_TICKER) {
      updateCurrencyHandlers(currency, newPrice, true)
    } else {
      updateTickerThroughBTC(currency)
    }
    return
  }
  if (type !== AGGREGATE_INDEX || !newPrice) return
  updateCurrencyHandlers(currency, newPrice)
})

function updateTickerThroughBTC(ticker) {
  const subscribes = tickersHandlers.get(ticker) || []
  const wrappedSubs = subscribes.map(
    (sub) => (currency, newPrice, hasError) => sub(currency, newPrice * LAST_BTC_PRICE, hasError)
  )
  tickersHandlers.set(ticker, wrappedSubs)
  subcribeToUpdateBTC()
  actionToTickerOnWS('SubAdd', ticker, BTC_TICKER)
}

function subcribeToUpdateBTC() {
  const updateBTCPrice = (currency, newPrice, hasError) => (LAST_BTC_PRICE = newPrice)
  subscribeToTicker(BTC_TICKER, updateBTCPrice)
}

function updateCurrencyHandlers(currency, newPrice, hasError) {
  const handlers = tickersHandlers.get(currency) ?? []
  handlers.forEach((fn) => fn(currency, newPrice, hasError))
}

export const loadSuggestTickers = () =>
  fetch('https://min-api.cryptocompare.com/data/all/coinlist?summary=true')
    .then((r) => r.json())
    .then((rawData) =>
      Object.entries(rawData.Data).map(([, value]) => ({ name: value.Symbol, fullname: value.FullName }))
    )

function actionToTickerOnWS(action, ticker, exhangeTicker = 'USD') {
  const message = JSON.stringify({
    action,
    subs: [`5~CCCAGG~${ticker}~${exhangeTicker}`]
  })
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(message)
    return
  }
  socket.addEventListener('open', () => socket.send(message), { once: true })
}

export const subscribeToTicker = (ticker, cb, exhangeTicker) => {
  const subscribes = tickersHandlers.get(ticker) || []
  const filteredSubscribe = subscribes.filter((fn) => fn != cb)
  tickersHandlers.set(ticker, [...filteredSubscribe, cb])
  actionToTickerOnWS('SubAdd', ticker, exhangeTicker)
}

export const unsubscribeFromTicker = (ticker, cb) => {
  const subscribes = tickersHandlers.get(ticker) || []
  const filteredSubscribe = subscribes.filter((fn) => fn != cb)
  if (filteredSubscribe.length) {
    tickersHandlers.set(ticker, filteredSubscribe)
  } else {
    actionToTickerOnWS('SubRemove', ticker)
    tickersHandlers.delete(ticker)
  }
}
