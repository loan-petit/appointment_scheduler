import * as React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'

const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full text-gray-800 bg-white">
      <FontAwesomeIcon icon={faCircleNotch} size="4x" spin />
    </div>
  )
}

export default LoadingOverlay
