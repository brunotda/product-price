import React from 'react'
import { defineMessages, FormattedNumber } from 'react-intl'
import { useProduct } from 'vtex.product-context'
import { FormattedCurrency } from 'vtex.format-currency'
import { FormattedPrice } from 'vtex.formatted-price'
import { IOMessageWithMarkers } from 'vtex.native-types'
import {
  useCssHandles,
  CssHandlesTypes,
  applyModifiers,
} from 'vtex.css-handles'

import { getDefaultSeller } from './modules/seller'
import { hideProductPrice } from './modules/hideProductPrice'

const CSS_HANDLES = [
  'sellingPrice',
  'sellingPriceValue',
  'sellingPriceValueFormatted',
  'sellingPriceWithTax',
  'sellingPriceWithUnitMultiplier',
  'taxPercentage',
  'taxValue',
  'measurementUnit',
  'unitMultiplier',
] as const

const messages = defineMessages({
  title: {
    id: 'admin/selling-price.title',
  },
  description: {
    id: 'admin/selling-price.description',
  },
  default: {
    id: 'store/selling-price.default',
  },
})

interface Props {
  message?: string
  markers?: string[]
  /** Used to override default CSS handles */
  classes?: CssHandlesTypes.CustomClasses<typeof CSS_HANDLES>
  alwaysShow?: boolean
}

function SellingPrice({
  message = messages.default.id,
  markers = [],
  classes,
  alwaysShow = false,
}: Props) {
  const { handles, withModifiers } = useCssHandles(CSS_HANDLES, {
    classes,
  })

  const productContextValue = useProduct()

  const seller = getDefaultSeller(productContextValue?.selectedItem?.sellers)

  const commercialOffer = seller?.commertialOffer

  if (
    !commercialOffer ||
    hideProductPrice({
      alwaysShow,
      availableQuantity: commercialOffer.AvailableQuantity,
    })
  ) {
    return null
  }

  const sellingPriceValue =
    commercialOffer.Price <= 0.01 ? 0 : commercialOffer.Price

  const listPriceValue =
    commercialOffer.ListPrice <= 0.01 ? 0 : commercialOffer.ListPrice

  const { taxPercentage } = commercialOffer
  const sellingPriceWithTax =
    sellingPriceValue + sellingPriceValue * taxPercentage

  const measurementUnit =
    productContextValue?.selectedItem?.measurementUnit ?? ''

  const unitMultiplier = productContextValue?.selectedItem?.unitMultiplier ?? 1
  const sellingPriceWithUnitMultiplier = commercialOffer.Price * unitMultiplier

  const taxValue = commercialOffer.Tax

  const hasListPrice = sellingPriceValue !== listPriceValue
  const hasMeasurementUnit = measurementUnit && measurementUnit !== 'un'
  const hasUnitMultiplier = unitMultiplier !== 1

  const containerClasses = withModifiers('sellingPrice', [
    hasListPrice ? 'hasListPrice' : '',
    hasMeasurementUnit ? 'hasMeasurementUnit' : '',
    hasUnitMultiplier ? 'hasUnitMultiplier' : '',
    alwaysShow && commercialOffer.AvailableQuantity <= 0 ? 'isUnavailable' : '',
  ])

  return (
    <span className={containerClasses}>
      <IOMessageWithMarkers
        message={message}
        markers={markers}
        handleBase="sellingPrice"
        values={{
          sellingPriceValue: (
            <span key="sellingPriceValue" className={handles.sellingPriceValue}>
              <FormattedCurrency value={sellingPriceValue} />
            </span>
          ),
          sellingPriceValueFormatted: (
            <span
              key="sellingPriceValueFormatted"
              className={`${handles.sellingPriceValue}  ${applyModifiers(
                handles.sellingPriceValue,
                sellingPriceValue === 0 ? 'gift' : ''
              )}`}
            >
              <FormattedPrice value={sellingPriceValue} />
            </span>
          ),
          sellingPriceWithTax: (
            <span
              key="sellingPriceWithTax"
              className={handles.sellingPriceWithTax}
            >
              <FormattedCurrency value={sellingPriceWithTax} />
            </span>
          ),
          sellingPriceWithUnitMultiplier: (
            <span
              key="sellingPriceWithUnitMultiplier"
              className={handles.sellingPriceWithUnitMultiplier}
            >
              <FormattedCurrency value={sellingPriceWithUnitMultiplier} />
            </span>
          ),
          taxPercentage: (
            <span key="taxPercentage" className={handles.taxPercentage}>
              <FormattedNumber value={taxPercentage} style="percent" />
            </span>
          ),
          taxValue: (
            <span key="taxValue" className={handles.taxValue}>
              <FormattedCurrency value={taxValue} />
            </span>
          ),
          hasMeasurementUnit,
          hasListPrice,
          hasUnitMultiplier,
          unitMultiplier: (
            <span key="unitMultiplier" className={handles.unitMultiplier}>
              <FormattedNumber value={unitMultiplier} />
            </span>
          ),
          measurementUnit: (
            <span key="measurementUnit" className={handles.measurementUnit}>
              {measurementUnit}
            </span>
          ),
        }}
      />
    </span>
  )
}

SellingPrice.schema = {
  title: messages.title.id,
}

export default SellingPrice
