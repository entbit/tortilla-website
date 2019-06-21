import React from 'react'
import styled from 'styled-components'
import { faDownload } from '@fortawesome/free-solid-svg-icons'

import Button from '../common/Button'
import FaIcon from '../common/FaIcon'

const IconContainer = styled.div`
  flex: 0 0 30px;
  width: 30px;
  height: 30px;
  border-radius: 3px;
  line-height: 30px;
  color: ${({ theme }) => theme.blueGray};
`
const Icon = styled(FaIcon).attrs({
  icon: faDownload,
  size: 17,
})``

const DownloadButton = styled(Button) `
  height: 40px;
  padding: 5px;
  display: flex;
  flex-direction: row;
  border-radius: 3px;
  border: 0 none;
  text-align: center;
  border: 1px solid ${({ theme }) => theme.separator};
`

export default props => (
  <DownloadButton href={props.url}>
    <IconContainer>
      <Icon />
    </IconContainer>
  </DownloadButton>
)