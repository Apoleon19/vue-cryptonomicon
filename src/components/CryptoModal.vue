<template>
  <div
    v-if="isOpen"
    class="bg-black bg-opacity-80 absolute top-0 w-full h-full flex justify-center items-center duration-300"
    @click="close"
  >
    <div class="relative bg-white m-h-48 p-4" @click.stop>
      <div class="mb-2 font-medium text-lg">
        <slot name="title"></slot>
      </div>
      <div class="mb-4">
        <slot name="body"></slot>
      </div>
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
        Oтмена
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
        OK
      </button>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    isOpen: { type: Boolean, required: true }
  },
  emits: {
    close: null,
    confirm: null
  },
  mounted() {
    document.addEventListener('keydown', this.handleEscapePress)
  },
  methods: {
    close() {
      this.$emit('close')
    },
    confirm() {
      this.$emit('confirm')
    },
    handleEscapePress(e) {
      if (this.isOpen && e.key == 'Escape') {
        this.close()
      }
    }
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleEscapePress)
  }
}
</script>
