import { ListUserTripsData, CreateNewTripData, CreateNewTripVariables, GetTripDetailsData, GetTripDetailsVariables, UpdateAccommodationDetailsData, UpdateAccommodationDetailsVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useListUserTrips(options?: useDataConnectQueryOptions<ListUserTripsData>): UseDataConnectQueryResult<ListUserTripsData, undefined>;
export function useListUserTrips(dc: DataConnect, options?: useDataConnectQueryOptions<ListUserTripsData>): UseDataConnectQueryResult<ListUserTripsData, undefined>;

export function useCreateNewTrip(options?: useDataConnectMutationOptions<CreateNewTripData, FirebaseError, CreateNewTripVariables>): UseDataConnectMutationResult<CreateNewTripData, CreateNewTripVariables>;
export function useCreateNewTrip(dc: DataConnect, options?: useDataConnectMutationOptions<CreateNewTripData, FirebaseError, CreateNewTripVariables>): UseDataConnectMutationResult<CreateNewTripData, CreateNewTripVariables>;

export function useGetTripDetails(vars: GetTripDetailsVariables, options?: useDataConnectQueryOptions<GetTripDetailsData>): UseDataConnectQueryResult<GetTripDetailsData, GetTripDetailsVariables>;
export function useGetTripDetails(dc: DataConnect, vars: GetTripDetailsVariables, options?: useDataConnectQueryOptions<GetTripDetailsData>): UseDataConnectQueryResult<GetTripDetailsData, GetTripDetailsVariables>;

export function useUpdateAccommodationDetails(options?: useDataConnectMutationOptions<UpdateAccommodationDetailsData, FirebaseError, UpdateAccommodationDetailsVariables>): UseDataConnectMutationResult<UpdateAccommodationDetailsData, UpdateAccommodationDetailsVariables>;
export function useUpdateAccommodationDetails(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateAccommodationDetailsData, FirebaseError, UpdateAccommodationDetailsVariables>): UseDataConnectMutationResult<UpdateAccommodationDetailsData, UpdateAccommodationDetailsVariables>;
