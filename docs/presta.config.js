import { theme as defaultTheme, configure, getCss } from 'hypobox'
import { document } from 'presta/document'
import { merge } from 'presta/utils/merge'

import { theme } from '@/src/lib/theme'

configure({ theme })

const name = `sure thing`
const image = `/og.png`

export const pages = 'src/pages/**/*.js'

export function createContent (context) {
  return document({
    head: merge(context.props.head, {
      image,
      og: {
        site_name: name,
        image,
        url: `https://sure-thing.net${context.path}`
      },
      twitter: {
        site_name: name,
        image,
        card: 'summary_large_image',
        creator: '@estrattonbailey'
      },
      meta: [{ name: 'author', content: '@estrattonbailey' }],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'stylesheet', href: '/style.css' }
      ],
      style: [{ id: 'style', children: getCss() }]
    }),
    body: `<div id="bg"></div><div id="root">${context.props.content}</div>`,
    foot: {
      script: [{ src: '/client.js' }]
    }
  })
}
