import { withPrefix } from 'gatsby'
import React from 'react'
import Helmet from 'react-helmet'
import { ThemeProvider } from 'styled-components'

import featuredTutorials from '../../featured-tutorials'
import Theme from '../../themes/home'
import Modal from '../common/Modal'
import SeoHelmet from '../common/SeoHelmet'
import SocialHelmet from '../common/SocialHelmet'

import 'sweetalert2/dist/sweetalert2.css'
import './index.css'

const description = 'Full JavaScript tutorials for free'

Modal.setAppElement('#___gatsby')

const link = [
  {
    href:
      'https://fonts.googleapis.com/css?family=Montserrat:300,300i,400,700,800,800i',
    rel: 'stylesheet',
  },
  {
    href: 'https://unpkg.com/highlight.js@9.12.0/styles/github.css',
    rel: 'stylesheet',
  },
  {
    href: withPrefix('favicon.png'),
    rel: 'icon',
  },
]

const meta = [
  {
    name: 'google-site-verification',
    content: 'Glmf8aCrncL2dnKoMscmc0BpnvaLTvA6feScexYo754',
  },
  { name: 'twitter:card', content: 'summary' },
  { property: 'og:type', content: 'website' },
  { name: 'Description', content: description }
]

const script = [
  // Global site tag (gtag.js) - Google Analytics
  {
    async: true,
    src: 'https://www.googletagmanager.com/gtag/js?id=UA-128969121-2',
  },
  {
    type: 'text/javascript',
    innerHTML: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','UA-128969121-2');`,
  },
]

class Layout extends React.Component {
  componentDidMount() {
    // Reveal resolution corrected body asap
    document.body.style.display = 'block'
  }

  render() {
    return (
      <ThemeProvider theme={Theme}>
        <div style={{ position: 'relative' }}>
          <SeoHelmet />
          <Helmet
            title={`tortilla.academy | ${description}`}
            meta={meta}
            link={link}
            script={script}
          />
          <SocialHelmet
            url={process.env.GATSBY_ORIGIN}
            title={featuredTutorials.default.title}
            description={featuredTutorials.default.description}
            image={withPrefix('Logo/logo.cover.png')}
          />
          <div>{this.props.children}</div>
        </div>
      </ThemeProvider>
    )
  }
}

export default Layout
