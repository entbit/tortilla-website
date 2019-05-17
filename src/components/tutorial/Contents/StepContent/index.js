import {
  faShoePrints,
  faLink,
  faQuestion,
} from '@fortawesome/free-solid-svg-icons'
import { push } from 'gatsby'
import React from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'

import { parseDiff } from '../../../../libs/react-diff-view'
import { stepRoute, isVersionSpecific } from '../../../../utils/routes'
import storage from '../../../../utils/storage'
import FaIcon from '../../../common/FaIcon'
import SocialHelmet from '../../../common/SocialHelmet'
import Stepper from '../../../common/Stepper'
import ImproveButton from '../../ImproveButton'
import SimpleDiffView from './SimpleDiffView'
import StepsHeader from './StepsHeader'
import StepsMenu from './StepsMenu'

const occupied = Symbol('occupied')
const MenuWidth = 300

const MenuContainer = styled.div`
  float: left;
  width: ${MenuWidth}px;
  position: fixed;
`

const ShowStepsButton = styled(FaIcon).attrs({
  icon: faShoePrints,
  size: 40,
})`
  padding: 10px;
  display: flex;
  flex-direction: row;
  border-radius: 3px;
  border: 0 none;
  text-align: center;
  border: 1px solid ${({ theme }) => theme.separator};
  color: ${({ theme }) => theme.blueGray};
  margin-right: 10px;
  cursor: pointer;
`

const ContentContainer = styled.div`
  float: left;
  width: calc(100% - ${MenuWidth}px);
  margin-left: ${MenuWidth}px;
  border-left: solid 1px ${({ theme }) => theme.separator};
`

const Header = styled.div`
  padding: 10.5px 25px;
  border-bottom: 1px solid ${({ theme }) => theme.separator};
  display: flex;
  flex: 0 0 auto;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  text-align: left;
  float: left;
  width: 100%;
`

const Footer = styled(Header) `
  border-top: 1px solid ${({ theme }) => theme.separator};
  width: 100%;
`

const Left = styled.div`
  display: flex;
  flex-direction: row;

  & > * {
    margin-right: 10px;
  }
`

const Info = styled.div`
  display: flex;
  margin-left: 10px;
  flex-direction: column;
  justify-content: space-between;
`

const Title = styled.div`
  font-size: 18px;
  font-weight: 800;
`

const Right = styled.div`
  display: flex;
  flex-direction: row;
`

const Html = styled.div`
  padding: 25px;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
  color: ${({ theme }) => theme.lightBlack};
  font-weight: normal;
  font-size: 14px;
  flex: 0 1 auto;
  overflow-y: auto;

  ._img-container {
    display: block;
    max-width: 50vw;
    margin: 25px auto !important;

    @media only screen and (max-width: 1024px) {
      max-width: 512px;
    }
  }

  a {
    color: firebrick;
  }

  h4 > a {
    margin-left: 15px;
    float: right;
    color: ${props => props.theme.blueGray};
    // font-size: 10px;
    // transform: translateY(-5px);
    // display: inline-block;
  }

  a:hover {
    text-decoration: underline;
  }

  pre {
    background-color: #f8f8f8;
    color: black;

    code {
      font-size: 12px;
    }
  }

  h1 {
    font-size: 34px;
  }

  h4 {
    font-size: 24px;
    color: ${props => props.theme.blueGray};
  }

  img {
    max-width: 100%;
    display: block;
    margin-left: auto;
    margin-right: auto;
  }

  h1,
  h2,
  h3,
  h4 {
    font-weight: normal;
  }
`

export default class extends React.Component {
  get contentContainerStyle() {
    return this.state.stepsMenuOpen
      ? {
          width: `calc(100% - ${MenuWidth}px)`,
          marginLeft: `${MenuWidth}px`,
        }
      : {
          width: '100%',
          marginLeft: 0,
        }
  }

  htmlRef = React.createRef()

  state = {
    stepsMenuOpen: storage.getItem('steps-menu-position') || true,
  }

  componentDidMount() {
    window.addEventListener('scroll', this.resetStepsMenuDimensions, true)

    this.resetStepsMenuDimensions()
    this.appendDiffs()
    this.fixImages()
    this.fixStepsRefs()
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.resetStepsMenuDimensions, true)
  }

  componentDidUpdate(props) {
    if (props.step.id !== this.props.step.id) {
      this.appendDiffs()
      this.fixImages()
      this.fixStepsRefs()
      this.props.resetScroller()
    }
  }

  changeStep(id) {
    const route = stepRoute({
      tutorialName: this.props.tutorial.name,
      version:
        isVersionSpecific(this.props.location.pathname) &&
        this.props.tutorial.version.number,
      step: id,
    })

    push(route)
  }

  render() {
    return (
      <div ref={ref => (this.container = ReactDOM.findDOMNode(ref))}>
        <SocialHelmet
          description={`${this.props.tutorialTitle} - ${this.props.step.name}`}
          image={this.props.tutorialImage}
        />
        {this.state.stepsMenuOpen && (
          <MenuContainer
            ref={ref => (this.stepsMenu = ReactDOM.findDOMNode(ref))}
          >
            <StepsHeader
              opened={this.state.stepsMenuOpen}
              style={{ width: `${MenuWidth}px`, float: 'left' }}
              close={this.closeStepsMenu}
              open={this.openStepsMenu}
            />
            {/*
              65px - Header height
              TODO: Softcode
            */}
            <StepsMenu
              ref={ref => (this.stepsMenuScroller = ReactDOM.findDOMNode(ref))}
              tutorialName={this.props.tutorial.name}
              tutorialVersion={this.props.tutorial.version}
              activeStep={this.props.step}
              pathname={this.props.location.pathname}
              style={{ height: 'calc(100% - 65px)' }}
            />
          </MenuContainer>
        )}
        <ContentContainer style={this.contentContainerStyle}>
          {this.renderBar(Header)}
          <Html
            ref={ref => (this.htmlEl = ReactDOM.findDOMNode(ref))}
            dangerouslySetInnerHTML={{ __html: this.props.step.html }}
          />
          {this.renderBar(Footer)}
        </ContentContainer>
      </div>
    )
  }

  renderBar(BarType, props = {}) {
    const step = this.props.step
    const stepsNum = this.props.tutorial.version.steps.length

    return (
      <BarType {...props}>
        <Left>
          <Title>{step.name}</Title>
        </Left>
        <Right>
          {/* // In case git URL is not defined in package.json */}
          {!this.state.stepsMenuOpen && (
            <ShowStepsButton onClick={this.openStepsMenu} />
          )}
          {this.props.tutorial.repo && (
            <ImproveButton
              step={step.id}
              url={this.props.tutorial.repo}
              branch={this.props.tutorial.branch}
            />
          )}
          <Info>
            <Stepper
              limit={stepsNum - 1}
              current={step.id}
              onChange={i => this.changeStep(i)}
            />
          </Info>
        </Right>
      </BarType>
    )
  }

  // TODO: Apply during build
  appendDiffs = async (diff, anchor, file) => {
    if (!diff) {
      return Promise.all(
        this.props.step.diffs.map(diff => {
          return this.appendDiffs(diff)
        })
      )
    }

    if (!anchor) {
      const title = `Step ${diff.index}`

      anchor = Array.from(this.htmlEl.childNodes).find(node => {
        return (
          node.tagName === 'H4' &&
          node.innerText.match(title) &&
          !node[occupied]
        )
      })

      anchor[occupied] = true

      // We'll make it the user's responsibility
      const files = parseDiff(diff.value, {
        showLong: true,
      })

      // First we need to collect the anchors before making modification, otherwise the
      // DOM tree would change and nextSibling would result in different elements
      const anchors = files.map(() => {
        return (anchor = anchor.nextElementSibling)
      })

      return Promise.all(
        files.map(file => {
          return this.appendDiffs(diff, anchors.shift(), file)
        })
      )
    }

    const container = document.createElement('span')

    this.htmlEl.insertBefore(container, anchor.nextSibling)

    return new Promise(resolve => {
      ReactDOM.render(
        <SimpleDiffView
          file={file}
          title={anchor.innerHTML}
          key={`${file.oldPath}_${file.newPath}`}
        />,
        container,
        () => {
          anchor.remove()
          resolve()
        }
      )
    })
  }

  // TODO: Apply during build
  fixImages = () => {
    this.htmlEl.querySelectorAll('img').forEach(el => {
      // Replace blob URLs with raw URLs
      if (el.src) {
        el.src = el.src.replace(/(.+?github\.com\/[^/]+\/[^/]+\/)blob/, '$1raw')
      }

      // The following container is necessary for styling where image size is gonna
      // be dynamic, not too big yet not too small
      const nextElementSibling = el.nextElementSibling
      const parentElement = el.parentElement
      const containerElement = document.createElement('div')

      containerElement.classList.add('_img-container')
      containerElement.appendChild(el)
      parentElement.insertBefore(containerElement, nextElementSibling)
    })
  }

  // TODO: Apply during build. It's not critical because of SSR, so effect would be
  // almost the same
  fixStepsRefs = () => {
    this.htmlEl.querySelectorAll('h4 > a').forEach(commitEl => {
      const titleEl = commitEl.parentNode
      const stepTitle = commitEl.innerHTML
      // e.g. Client Step 1.1
      // Tortilla was updated to render the submodule name prior to the step
      const [prefix] = stepTitle.match(/^([\w-]+ )?[Ss]tep \d+(\.\d+)?/) || []
      const questionEl = document.createElement('a')

      ReactDOM.render(<FaIcon icon={faLink} />, commitEl)
      ReactDOM.render(<FaIcon icon={faQuestion} />, questionEl)

      questionEl.href = `${this.props.tutorial.repoUrl}/issues/new?title=[${prefix}]`
      titleEl.innerHTML = stepTitle + ' '
      titleEl.appendChild(commitEl)
      titleEl.appendChild(questionEl)
    })
  }

  openStepsMenu = () => {
    this.setState(
      {
        stepsMenuOpen: true,
      },
      () => {
        window.addEventListener('scroll', this.resetStepsMenuDimensions, true)
        storage.setItem('steps-menu-opened', true)
        this.resetStepsMenuDimensions()
      }
    )
  }

  closeStepsMenu = () => {
    this.setState(
      {
        stepsMenuOpen: false,
      },
      () => {
        window.removeEventListener(
          'scroll',
          this.resetStepsMenuDimensions,
          true
        )
        storage.setItem('steps-menu-opened', false)
        this.resetStepsMenuDimensions()
      }
    )
  }

  resetStepsMenuDimensions = e => {
    if (!this.container) return
    if (!this.stepsMenu) return
    if (e && !e.target.contains(this.stepsMenu)) return

    let { top } = this.container.getBoundingClientRect()
    top = Math.max(top, 0) + 'px'

    // TODO: Make sticky logic generic.
    // Note that position: sticky doesn't work and if so has poor comparability
    this.stepsMenu.style.top = top
    this.stepsMenu.style.height = `calc(100% - ${top})`
  }
}
