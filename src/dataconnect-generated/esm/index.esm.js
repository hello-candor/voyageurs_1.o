import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'voyageurs1o',
  location: 'us-central1'
};

export const listUserTripsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListUserTrips');
}
listUserTripsRef.operationName = 'ListUserTrips';

export function listUserTrips(dc) {
  return executeQuery(listUserTripsRef(dc));
}

export const createNewTripRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewTrip', inputVars);
}
createNewTripRef.operationName = 'CreateNewTrip';

export function createNewTrip(dcOrVars, vars) {
  return executeMutation(createNewTripRef(dcOrVars, vars));
}

export const getTripDetailsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetTripDetails', inputVars);
}
getTripDetailsRef.operationName = 'GetTripDetails';

export function getTripDetails(dcOrVars, vars) {
  return executeQuery(getTripDetailsRef(dcOrVars, vars));
}

export const updateAccommodationDetailsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateAccommodationDetails', inputVars);
}
updateAccommodationDetailsRef.operationName = 'UpdateAccommodationDetails';

export function updateAccommodationDetails(dcOrVars, vars) {
  return executeMutation(updateAccommodationDetailsRef(dcOrVars, vars));
}

