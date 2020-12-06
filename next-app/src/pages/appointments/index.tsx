import React from 'react'
import Router from 'next/router'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'
import { EventClickArg } from '@fullcalendar/react'

import Appointment, { AppointmentOperations } from '../../models/Appointment'
import User from '../../models/User'
import LoadingOverlay from '../../components/shared/LoadingOverlay'
import isIntervalAllDay from '../../utils/isIntervalAllDay'
import { withApollo } from '../../apollo/client'
import Layout from '../../components/adminSite/Layout'
import AppointmentModal from '../../components/adminSite/AppointmentModal'
import FullCalendarComponent from '../../components/shared/FullCalendar'

const CurrentUserQuery = gql`
  query CurrentUserQuery {
    me {
      user {
        id
      }
    }
  }
`

const Appointments = () => {
  const [selectedAppointment, setSelectedAppointment] = React.useState<
    Appointment
  >()

  const [currentUser, setCurrentUser] = React.useState<User>()

  const currentUserQueryResult = useQuery(CurrentUserQuery)
  const appointmentsQueryResult = useQuery(AppointmentOperations.appointments, {
    variables: { userId: currentUser?.id },
    skip: !currentUser,
  })

  // Verify CurrentUserQuery result
  if (currentUserQueryResult.loading) return <LoadingOverlay />
  else if (currentUserQueryResult.error) {
    Router.push('/auth/signin')
    return <div />
  }
  if (!currentUser) {
    setCurrentUser(currentUserQueryResult.data.me.user)
    return <div />
  }

  // Verify AppointmentsQuery result
  if (appointmentsQueryResult.loading) return <LoadingOverlay />
  else if (appointmentsQueryResult.error) {
    return (
      <p className='error-message'>
        Une erreur est survenue. Veuillez-réessayer.
      </p>
    )
  } else if (!appointmentsQueryResult.data) {
    return <div />
  }
  const appointments: Appointment[] =
    appointmentsQueryResult.data.user.appointments

  return (
    <Layout>
      <FullCalendarComponent
        initialView='timeGridWeek'
        headerToolbar={{
          start: 'prev,next today',
          center: 'title',
          end: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        views={{
          dayGrid: {
            dayHeaderFormat: {
              weekday: 'short',
            },
          },
          week: {
            dayHeaderFormat: {
              weekday: 'short',
            },
          },
        }}
        stickyHeaderDates='true'
        nowIndicator={true}
        navLinks={true}
        allDaySlot={false}
        events={appointments.map(v => {
          const isAllDay = isIntervalAllDay(v.start, v.end)

          return {
            id: v.id.toString(),
            title: v.appointmentType?.name,
            start: v.start,
            end: !isAllDay ? v.end : undefined,
            allDay: isAllDay,
          }
        })}
        eventClick={({ event }: EventClickArg) =>
          setSelectedAppointment(
            appointments.find(v => event.id == v.id.toString()),
          )
        }
      />
      <AppointmentModal
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(undefined)}
      />
    </Layout>
  )
}

export default withApollo(Appointments)
