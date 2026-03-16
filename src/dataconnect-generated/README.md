# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListUserTrips*](#listusertrips)
  - [*GetTripDetails*](#gettripdetails)
- [**Mutations**](#mutations)
  - [*CreateNewTrip*](#createnewtrip)
  - [*UpdateAccommodationDetails*](#updateaccommodationdetails)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListUserTrips
You can execute the `ListUserTrips` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listUserTrips(): QueryPromise<ListUserTripsData, undefined>;

interface ListUserTripsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUserTripsData, undefined>;
}
export const listUserTripsRef: ListUserTripsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listUserTrips(dc: DataConnect): QueryPromise<ListUserTripsData, undefined>;

interface ListUserTripsRef {
  ...
  (dc: DataConnect): QueryRef<ListUserTripsData, undefined>;
}
export const listUserTripsRef: ListUserTripsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listUserTripsRef:
```typescript
const name = listUserTripsRef.operationName;
console.log(name);
```

### Variables
The `ListUserTrips` query has no variables.
### Return Type
Recall that executing the `ListUserTrips` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListUserTripsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListUserTrips`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listUserTrips } from '@dataconnect/generated';


// Call the `listUserTrips()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listUserTrips();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listUserTrips(dataConnect);

console.log(data.trips);

// Or, you can use the `Promise` API.
listUserTrips().then((response) => {
  const data = response.data;
  console.log(data.trips);
});
```

### Using `ListUserTrips`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listUserTripsRef } from '@dataconnect/generated';


// Call the `listUserTripsRef()` function to get a reference to the query.
const ref = listUserTripsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listUserTripsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.trips);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.trips);
});
```

## GetTripDetails
You can execute the `GetTripDetails` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getTripDetails(vars: GetTripDetailsVariables): QueryPromise<GetTripDetailsData, GetTripDetailsVariables>;

interface GetTripDetailsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetTripDetailsVariables): QueryRef<GetTripDetailsData, GetTripDetailsVariables>;
}
export const getTripDetailsRef: GetTripDetailsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getTripDetails(dc: DataConnect, vars: GetTripDetailsVariables): QueryPromise<GetTripDetailsData, GetTripDetailsVariables>;

interface GetTripDetailsRef {
  ...
  (dc: DataConnect, vars: GetTripDetailsVariables): QueryRef<GetTripDetailsData, GetTripDetailsVariables>;
}
export const getTripDetailsRef: GetTripDetailsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getTripDetailsRef:
```typescript
const name = getTripDetailsRef.operationName;
console.log(name);
```

### Variables
The `GetTripDetails` query requires an argument of type `GetTripDetailsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetTripDetailsVariables {
  tripId: UUIDString;
}
```
### Return Type
Recall that executing the `GetTripDetails` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetTripDetailsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetTripDetails`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getTripDetails, GetTripDetailsVariables } from '@dataconnect/generated';

// The `GetTripDetails` query requires an argument of type `GetTripDetailsVariables`:
const getTripDetailsVars: GetTripDetailsVariables = {
  tripId: ..., 
};

// Call the `getTripDetails()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getTripDetails(getTripDetailsVars);
// Variables can be defined inline as well.
const { data } = await getTripDetails({ tripId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getTripDetails(dataConnect, getTripDetailsVars);

console.log(data.trip);

// Or, you can use the `Promise` API.
getTripDetails(getTripDetailsVars).then((response) => {
  const data = response.data;
  console.log(data.trip);
});
```

### Using `GetTripDetails`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getTripDetailsRef, GetTripDetailsVariables } from '@dataconnect/generated';

// The `GetTripDetails` query requires an argument of type `GetTripDetailsVariables`:
const getTripDetailsVars: GetTripDetailsVariables = {
  tripId: ..., 
};

// Call the `getTripDetailsRef()` function to get a reference to the query.
const ref = getTripDetailsRef(getTripDetailsVars);
// Variables can be defined inline as well.
const ref = getTripDetailsRef({ tripId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getTripDetailsRef(dataConnect, getTripDetailsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.trip);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.trip);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateNewTrip
You can execute the `CreateNewTrip` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createNewTrip(vars: CreateNewTripVariables): MutationPromise<CreateNewTripData, CreateNewTripVariables>;

interface CreateNewTripRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewTripVariables): MutationRef<CreateNewTripData, CreateNewTripVariables>;
}
export const createNewTripRef: CreateNewTripRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createNewTrip(dc: DataConnect, vars: CreateNewTripVariables): MutationPromise<CreateNewTripData, CreateNewTripVariables>;

interface CreateNewTripRef {
  ...
  (dc: DataConnect, vars: CreateNewTripVariables): MutationRef<CreateNewTripData, CreateNewTripVariables>;
}
export const createNewTripRef: CreateNewTripRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createNewTripRef:
```typescript
const name = createNewTripRef.operationName;
console.log(name);
```

### Variables
The `CreateNewTrip` mutation requires an argument of type `CreateNewTripVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateNewTripVariables {
  name: string;
  startDate: DateString;
  endDate: DateString;
  destination: string;
  description?: string | null;
}
```
### Return Type
Recall that executing the `CreateNewTrip` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateNewTripData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateNewTripData {
  trip_insert: Trip_Key;
}
```
### Using `CreateNewTrip`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createNewTrip, CreateNewTripVariables } from '@dataconnect/generated';

// The `CreateNewTrip` mutation requires an argument of type `CreateNewTripVariables`:
const createNewTripVars: CreateNewTripVariables = {
  name: ..., 
  startDate: ..., 
  endDate: ..., 
  destination: ..., 
  description: ..., // optional
};

// Call the `createNewTrip()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createNewTrip(createNewTripVars);
// Variables can be defined inline as well.
const { data } = await createNewTrip({ name: ..., startDate: ..., endDate: ..., destination: ..., description: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createNewTrip(dataConnect, createNewTripVars);

console.log(data.trip_insert);

// Or, you can use the `Promise` API.
createNewTrip(createNewTripVars).then((response) => {
  const data = response.data;
  console.log(data.trip_insert);
});
```

### Using `CreateNewTrip`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createNewTripRef, CreateNewTripVariables } from '@dataconnect/generated';

// The `CreateNewTrip` mutation requires an argument of type `CreateNewTripVariables`:
const createNewTripVars: CreateNewTripVariables = {
  name: ..., 
  startDate: ..., 
  endDate: ..., 
  destination: ..., 
  description: ..., // optional
};

// Call the `createNewTripRef()` function to get a reference to the mutation.
const ref = createNewTripRef(createNewTripVars);
// Variables can be defined inline as well.
const ref = createNewTripRef({ name: ..., startDate: ..., endDate: ..., destination: ..., description: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createNewTripRef(dataConnect, createNewTripVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.trip_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.trip_insert);
});
```

## UpdateAccommodationDetails
You can execute the `UpdateAccommodationDetails` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateAccommodationDetails(vars: UpdateAccommodationDetailsVariables): MutationPromise<UpdateAccommodationDetailsData, UpdateAccommodationDetailsVariables>;

interface UpdateAccommodationDetailsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateAccommodationDetailsVariables): MutationRef<UpdateAccommodationDetailsData, UpdateAccommodationDetailsVariables>;
}
export const updateAccommodationDetailsRef: UpdateAccommodationDetailsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateAccommodationDetails(dc: DataConnect, vars: UpdateAccommodationDetailsVariables): MutationPromise<UpdateAccommodationDetailsData, UpdateAccommodationDetailsVariables>;

interface UpdateAccommodationDetailsRef {
  ...
  (dc: DataConnect, vars: UpdateAccommodationDetailsVariables): MutationRef<UpdateAccommodationDetailsData, UpdateAccommodationDetailsVariables>;
}
export const updateAccommodationDetailsRef: UpdateAccommodationDetailsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateAccommodationDetailsRef:
```typescript
const name = updateAccommodationDetailsRef.operationName;
console.log(name);
```

### Variables
The `UpdateAccommodationDetails` mutation requires an argument of type `UpdateAccommodationDetailsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `UpdateAccommodationDetails` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateAccommodationDetailsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateAccommodationDetailsData {
  accommodation_update?: Accommodation_Key | null;
}
```
### Using `UpdateAccommodationDetails`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateAccommodationDetails, UpdateAccommodationDetailsVariables } from '@dataconnect/generated';

// The `UpdateAccommodationDetails` mutation requires an argument of type `UpdateAccommodationDetailsVariables`:
const updateAccommodationDetailsVars: UpdateAccommodationDetailsVariables = {
  accommodationId: ..., 
  name: ..., // optional
  type: ..., // optional
  checkInDate: ..., // optional
  checkOutDate: ..., // optional
  address: ..., // optional
  bookingConfirmation: ..., // optional
  notes: ..., // optional
};

// Call the `updateAccommodationDetails()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateAccommodationDetails(updateAccommodationDetailsVars);
// Variables can be defined inline as well.
const { data } = await updateAccommodationDetails({ accommodationId: ..., name: ..., type: ..., checkInDate: ..., checkOutDate: ..., address: ..., bookingConfirmation: ..., notes: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateAccommodationDetails(dataConnect, updateAccommodationDetailsVars);

console.log(data.accommodation_update);

// Or, you can use the `Promise` API.
updateAccommodationDetails(updateAccommodationDetailsVars).then((response) => {
  const data = response.data;
  console.log(data.accommodation_update);
});
```

### Using `UpdateAccommodationDetails`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateAccommodationDetailsRef, UpdateAccommodationDetailsVariables } from '@dataconnect/generated';

// The `UpdateAccommodationDetails` mutation requires an argument of type `UpdateAccommodationDetailsVariables`:
const updateAccommodationDetailsVars: UpdateAccommodationDetailsVariables = {
  accommodationId: ..., 
  name: ..., // optional
  type: ..., // optional
  checkInDate: ..., // optional
  checkOutDate: ..., // optional
  address: ..., // optional
  bookingConfirmation: ..., // optional
  notes: ..., // optional
};

// Call the `updateAccommodationDetailsRef()` function to get a reference to the mutation.
const ref = updateAccommodationDetailsRef(updateAccommodationDetailsVars);
// Variables can be defined inline as well.
const ref = updateAccommodationDetailsRef({ accommodationId: ..., name: ..., type: ..., checkInDate: ..., checkOutDate: ..., address: ..., bookingConfirmation: ..., notes: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateAccommodationDetailsRef(dataConnect, updateAccommodationDetailsVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.accommodation_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.accommodation_update);
});
```

