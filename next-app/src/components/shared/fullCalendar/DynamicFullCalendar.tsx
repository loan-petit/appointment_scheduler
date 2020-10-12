import dynamic from 'next/dynamic'
import LoadingOverlay from '../LoadingOverlay'

const DynamicFullCalendar = dynamic(() => import('../FullCalendar'), {
  loading: () => <LoadingOverlay />,
  ssr: false,
})

export default DynamicFullCalendar
