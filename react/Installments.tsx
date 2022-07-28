import React from 'react'
import { defineMessages } from 'react-intl'
import { useCssHandles, CssHandlesTypes } from 'vtex.css-handles'
import { useProduct } from 'vtex.product-context'

import InstallmentsRenderer, {
  CSS_HANDLES,
} from './components/InstallmentsRenderer'
import {
  pickMaxInstallmentsOption,
  pickMaxInstallmentsOptionWithoutInterest,
} from './modules/pickInstallments'
import { getDefaultSeller } from './modules/seller'

const messages = defineMessages({
  title: {
    id: 'admin/installments.title',
  },
  description: {
    id: 'admin/installments.description',
  },
  default: {
    id: 'store/installments.default',
  },
})

interface Props {
  message?: string
  markers?: string[]
  installmentsCriteria?: 'max-quantity' | 'max-quantity-without-interest'
  installmentOptionsFilter?: {
    paymentSystemName?: string
    installmentsQuantity?: number
  }
  /** Used to override default CSS handles */
  classes?: CssHandlesTypes.CustomClasses<typeof CSS_HANDLES>
}

function Installments({
  message = messages.default.id,
  markers = [],
  installmentsCriteria = 'max-quantity',
  installmentOptionsFilter,
  classes,
}: Props) {
  const productContextValue = useProduct()
  const { handles, withModifiers } = useCssHandles(CSS_HANDLES, { classes })
  const seller = getDefaultSeller(productContextValue?.selectedItem?.sellers)

  const commercialOffer = seller?.commertialOffer

  if (
    !commercialOffer?.Installments ||
    commercialOffer?.Installments?.length === 0 ||
    commercialOffer.Price <= 0.01
  ) {
    return null
  }

  let [installmentsOption] = commercialOffer.Installments

  switch (installmentsCriteria) {
    case 'max-quantity-without-interest': {
      installmentsOption = pickMaxInstallmentsOptionWithoutInterest(
        commercialOffer.Installments,
        installmentOptionsFilter
      )

      break
    }

    default: {
      installmentsOption = pickMaxInstallmentsOption(
        commercialOffer.Installments,
        installmentOptionsFilter
      )

      break
    }
  }

  return (
    <InstallmentsRenderer
      message={message}
      markers={markers}
      installment={installmentsOption}
      handles={handles}
      handlesModifierFunction={withModifiers}
    />
  )
}

Installments.schema = {
  title: messages.title.id,
}

export default Installments
