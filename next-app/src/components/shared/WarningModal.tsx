import * as React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faExclamationTriangle,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons'

type Props = {
  warningMessage: string
  onCancel: () => void
  onConfirm: () => void
  isShown?: boolean
}

const WarningModal: React.FunctionComponent<Props> = ({
  warningMessage,
  onCancel,
  onConfirm,
  isShown,
}) => {
  if (!isShown) return <div />

  return (
    <>
      {/* Background greyed out */}
      <div className="fixed inset-0 bg-gray-700 opacity-25" />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="my-3 bg-white rounded-lg shadow-lg md:w-1/3 sm:w-full">
          <div className="flex justify-between px-5 py-4 border-b border-gray-200">
            <div>
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="mr-6 text-orange-500"
              />
              <span className="text-lg font-bold text-gray-700">Attention</span>
            </div>
            <div>
              <button onClick={onCancel}>
                <FontAwesomeIcon
                  icon={faTimesCircle}
                  className="text-red-500 hover:text-red-600"
                />
              </button>
            </div>
          </div>

          <div className="px-10 py-5 text-gray-600">{warningMessage}</div>

          <div className="flex justify-end px-5 py-4">
            <button
              className="px-3 py-2 mr-1 text-sm text-white transition duration-150 bg-orange-500 rounded hover:bg-orange-600"
              onClick={onCancel}
            >
              Annuler
            </button>
            <button
              className="px-3 py-2 text-sm text-gray-600 transition duration-150 hover:text-gray-800"
              onClick={onConfirm}
            >
              Confirmer
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default WarningModal
