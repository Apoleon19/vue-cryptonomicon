const API_KEY = '5ce0b83a3cd367f4805d7cde091fadfd4ef6a58b6d3b850f90ecf9cce52bc63b'

const tickersHandlers = new Map()

const loadTickers = () => {
  if (tickersHandlers.size === 0) return
  const subscribedTickers = Array.from(tickersHandlers.keys())
  fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?tsyms=USD&fsyms=${subscribedTickers.join(
      ','
    )}&api_key=${API_KEY}`
  )
    .then((r) => r.json())
    .then((rawData) => {
      Object.entries(rawData).forEach(([currency, value]) => {
        const handlers = tickersHandlers.get(currency) ?? []
        handlers.forEach((fn) => fn(currency, value.USD))
      })
    })
}

export const loadSuggestTickers = () =>
  fetch('https://min-api.cryptocompare.com/data/all/coinlist?summary=true').then((r) => r.json())

export const subscribeToTicker = (ticker, cb) => {
  const subscribes = tickersHandlers.get(ticker) || []
  tickersHandlers.set(ticker, [...subscribes, cb])
}

export const unsubscribeFromTicker = (ticker, cb) => {
  const subscribes = tickersHandlers.get(ticker) || []
  const filteredSubscribe = subscribes.filter((fn) => fn != cb)
  if (filteredSubscribe.length) {
    tickersHandlers.set(ticker, filteredSubscribe)
  } else {
    tickersHandlers.delete(ticker)
  }
}

setInterval(loadTickers, 5000)

window.t = tickersHandlers
