const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'voyageurs1o',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

const listUserTripsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListUserTrips');
}
listUserTripsRef.operationName = 'ListUserTrips';
exports.listUserTripsRef = listUserTripsRef;

exports.listUserTrips = function listUserTrips(dc) {
  return executeQuery(listUserTripsRef(dc));
};

const createNewTripRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewTrip', inputVars);
}
createNewTripRef.operationName = 'CreateNewTrip';
exports.createNewTripRef = createNewTripRef;

exports.createNewTrip = function createNewTrip(dcOrVars, vars) {
  return executeMutation(createNewTripRef(dcOrVars, vars));
};

const getTripDetailsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetTripDetails', inputVars);
}
getTripDetailsRef.operationName = 'GetTripDetails';
exports.getTripDetailsRef = getTripDetailsRef;

exports.getTripDetails = function getTripDetails(dcOrVars, vars) {
  return executeQuery(getTripDetailsRef(dcOrVars, vars));
};

const updateAccommodationDetailsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateAccommodationDetails', inputVars);
}
updateAccommodationDetailsRef.operationName = 'UpdateAccommodationDetails';
exports.updateAccommodationDetailsRef = updateAccommodationDetailsRef;

exports.updateAccommodationDetails = function updateAccommodationDetails(dcOrVars, vars) {
  return executeMutation(updateAccommodationDetailsRef(dcOrVars, vars));
};
