export class APILayer {
    private apiKey: string;
    private baseUrl: string = "http://api.aviationstack.com/v1";
  
    constructor(apiKey: string) {
      if (!apiKey) {
        throw new Error("API key is required for APILayer");
      }
      this.apiKey = apiKey;
    }
  
    private async fetchFromApi(endpoint: string, params: URLSearchParams) {
      params.append("access_key", this.apiKey);
      const response = await fetch(`${this.baseUrl}/${endpoint}?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      return response.json();
    }
  
    public async fetchAirportData(query: string) {
      const params = new URLSearchParams();
      params.append("search", query);
      return this.fetchFromApi("airports", params);
    }
  }
  