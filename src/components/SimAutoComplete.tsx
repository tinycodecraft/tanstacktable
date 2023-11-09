import React, { useEffect, useRef, useState } from 'react'
import styled from '@emotion/styled'

const SimAutoComplete = ({
  options,
  value,
  placeholder,
  onChange,
  ...props
}: { options: string[]; onChange: (value: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) => {
  const autocomplete = useRef<HTMLDivElement>(null)

  const [optionsData, setOptionsData] = useState<string[]>([])
  const [query, setQuery] = useState(value)
  const [isShow, setIsShow] = useState(false)

  const handleInputChange = (v: string) => {
    setQuery(v)
    onChange(v)
    v === '' ? setOptionsData(options) : setOptionsData([...options.filter((x) => String(x).toLowerCase().indexOf(v.toLowerCase()) > -1)])
  }

  const handleClickOutSide = (e: Event) => {
    if (autocomplete.current && !autocomplete.current.contains(e.target as Node)) {
      setIsShow(false)
    }
  }

  const hilightSearchText = (text: string) => {
    const pattern = new RegExp('(' + query + ')', 'gi')
    const newText = text.replace(pattern, `<b>${query}</b>`)
    return newText
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutSide)
    return () => {
      document.removeEventListener('mousedown', handleClickOutSide)
    }
  }, [])

  useEffect(() => {
    optionsData.length !== 0 ? setIsShow(true) : setIsShow(false)
  }, [optionsData])

  return (
    <Wrapper ref={autocomplete}>
      <InputField type='search' placeholder={placeholder} value={query} onChange={(e) => handleInputChange(e.target.value)} {...props} />
      {isShow && (
        <ListWrapper>
          {optionsData.map((x, index) => (
            <ListItem
              onClick={(e) => {
                setQuery(x)
                setIsShow(false)
                onChange(x)
              }}
              key={index}
            >
              {<div dangerouslySetInnerHTML={{ __html: hilightSearchText(x) }} />}
            </ListItem>
          ))}
        </ListWrapper>
      )}
    </Wrapper>
  )
}

export default SimAutoComplete

const Wrapper = styled.div`
  position: relative;
  min-width: 320px;
`

const InputField = styled.input`
  position: relative;
  width: 100%;
  font-size: 14px;
  color: #000;
  border: 2px solid #e3e3e3;
  border-radius: 8px;
  padding: 0 12px;
  height: 44px;
  outline: none;
`

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  margin-top: 0.5rem;
  position: absolute;
  top: 44px;
  z-index: 10;
  background: #fff;
  border-radius: 4px;
  width: 100%;
  max-height: 240px;
  overflow-y: auto;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
`

const ListItem = styled.button`
  text-align: left;
  padding: 4px 8px;
  width: 100%;
  background: #fff;
  outline: none;
  border: none;
  font-size: 14px;
  color: #5a5353;
  font-weight: 400;

  &:hover {
    background: #e2e2e2;
  }
`
