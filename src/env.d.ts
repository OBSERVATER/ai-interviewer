/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*?url' {
  const content: string
  export default content
}

declare module '*?worker' {
  const content: new () => Worker
  export default content
}
