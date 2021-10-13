<template>
  <div
    v-if="isOpen"
    class="bg-black bg-opacity-80 absolute top-0 w-full h-full flex justify-center items-center duration-300"
    @click="close"
  >
    <div class="relative bg-white m-h-48 p-5" @click.stop>
      <div class="mb-2 font-medium text-lg">
        <slot name="title">{{ options.title }}</slot>
      </div>
      <div class="mb-4">
        <slot name="body">{{ options.body }}</slot>
      </div>
      <slot name="footer" :confirm="confirm" :close="close">
        <button
          @click="close"
          type="button"
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
            bg-gray-400
            mr-2
            hover:bg-gray-700
            transition-colors
            duration-300
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
          "
        >
          {{ options.cancelText }}
        </button>
        <button
          @click="confirm"
          type="button"
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
          {{ options.confirmText }}
        </button>
      </slot>
    </div>
  </div>
</template>
<script>
export default {
  modalController: null,
  mounted() {
    document.addEventListener('keydown', this.handleKeyPress)
  },
  data() {
    return { isOpen: false, options: { title: '', body: '', confirmText: 'Ok', cancelText: 'Отмена' } }
  },
  methods: {
    open(options) {
      this.options = { ...this.options, ...options }

      let resolve
      let reject
      const modalPromise = new Promise((ok, fail) => {
        resolve = ok
        reject = fail
      })

      this.$options.modalController = { resolve, reject }
      this.isOpen = true

      return modalPromise
    },
    close() {
      this.$options.modalController.resolve(false)
      this.isOpen = false
    },
    confirm() {
      this.$options.modalController.resolve(true)
      this.isOpen = false
    },
    handleKeyPress(e) {
      if (!this.isOpen) return
      e.key == 'Escape' && this.close()
      e.key == 'Enter' && this.confirm()
    }
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleEscapePress)
  }
}
</script>
