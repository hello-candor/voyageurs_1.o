import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Accommodation_Key {
  id: UUIDString;
  __typename?: 'Accommodation_Key';
}

export interface Activity_Key {
  id: UUIDString;
  __typename?: 'Activity_Key';
}

export interface CreateNewTripData {
  trip_insert: Trip_Key;
}

export interface CreateNewTripVariables {
  name: string;
  startDate: DateString;
  endDate: DateString;
  destination: string;
  description?: string | null;
}

export interface GetTripDetailsData {
  trip?: {
    id: UUIDString;
    name: string;
    startDate: DateString;
    endDate: DateString;
    destination: string;
    description?: string | null;
    creator: {
      displayName: string;
      email: string;
    };
      accommodations_on_trip: ({
        id: UUIDString;
        name: string;
        type: string;
        checkInDate: DateString;
        checkOutDate: DateString;
        address?: string | null;
        bookingConfirmation?: string | null;
        notes?: string | null;
      } & Accommodation_Key)[];
        activities_on_trip: ({
          id: UUIDString;
          name: string;
          type: string;
          startTime: TimestampString;
          endTime: TimestampString;
          location?: string | null;
          description?: string | null;
          bookingReference?: string | null;
        } & Activity_Key)[];
          tripGuests_on_trip: ({
            user: {
              displayName: string;
              email: string;
            };
              status: string;
              role?: string | null;
          })[];
  } & Trip_Key;
}

export interface GetTripDetailsVariables {
  tripId: UUIDString;
}

export interface ListUserTripsData {
  trips: ({
    id: UUIDString;
    name: string;
    startDate: DateString;
    endDate: DateString;
    destination: string;
    description?: string | null;
    createdAt: TimestampString;
  } & Trip_Key)[];
}

export interface TripGuest_Key {
  userId: UUIDString;
  tripId: UUIDString;
  __typename?: 'TripGuest_Key';
}

export interface Trip_Key {
  id: UUIDString;
  __typename?: 'Trip_Key';
}

export interface UpdateAccommodationDetailsData {
  accommodation_update?: Accommodation_Key | null;
}

export interface UpdateAccommodationDetailsVariables {
  accommodationId: UUIDString;
  name?: string | null;
  type?: string | null;
  checkInDate?: DateString | null;
  checkOutDate?: DateString | null;
  address?: string | null;
  bookingConfirmation?: string | null;
  notes?: string | null;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface ListUserTripsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUserTripsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListUserTripsData, undefined>;
  operationName: string;
}
export const listUserTripsRef: ListUserTripsRef;

export function listUserTrips(): QueryPromise<ListUserTripsData, undefined>;
export function listUserTrips(dc: DataConnect): QueryPromise<ListUserTripsData, undefined>;

interface CreateNewTripRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewTripVariables): MutationRef<CreateNewTripData, CreateNewTripVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateNewTripVariables): MutationRef<CreateNewTripData, CreateNewTripVariables>;
  operationName: string;
}
export const createNewTripRef: CreateNewTripRef;

export function createNewTrip(vars: CreateNewTripVariables): MutationPromise<CreateNewTripData, CreateNewTripVariables>;
export function createNewTrip(dc: DataConnect, vars: CreateNewTripVariables): MutationPromise<CreateNewTripData, CreateNewTripVariables>;

interface GetTripDetailsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetTripDetailsVariables): QueryRef<GetTripDetailsData, GetTripDetailsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetTripDetailsVariables): QueryRef<GetTripDetailsData, GetTripDetailsVariables>;
  operationName: string;
}
export const getTripDetailsRef: GetTripDetailsRef;

export function getTripDetails(vars: GetTripDetailsVariables): QueryPromise<GetTripDetailsData, GetTripDetailsVariables>;
export function getTripDetails(dc: DataConnect, vars: GetTripDetailsVariables): QueryPromise<GetTripDetailsData, GetTripDetailsVariables>;

interface UpdateAccommodationDetailsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateAccommodationDetailsVariables): MutationRef<UpdateAccommodationDetailsData, UpdateAccommodationDetailsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateAccommodationDetailsVariables): MutationRef<UpdateAccommodationDetailsData, UpdateAccommodationDetailsVariables>;
  operationName: string;
}
export const updateAccommodationDetailsRef: UpdateAccommodationDetailsRef;

export function updateAccommodationDetails(vars: UpdateAccommodationDetailsVariables): MutationPromise<UpdateAccommodationDetailsData, UpdateAccommodationDetailsVariables>;
export function updateAccommodationDetails(dc: DataConnect, vars: UpdateAccommodationDetailsVariables): MutationPromise<UpdateAccommodationDetailsData, UpdateAccommodationDetailsVariables>;

