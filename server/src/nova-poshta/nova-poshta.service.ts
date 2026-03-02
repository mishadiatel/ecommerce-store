import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class NovaPoshtaService {
  private apiKey = process.env.NOVA_POSHTA_API_KEY;
  private baseUrl = 'https://api.novaposhta.ua/v2.0/json/';
  async searchCities(query: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data } = await axios.post(this.baseUrl, {
      apiKey: this.apiKey,
      modelName: 'Address',
      calledMethod: 'searchSettlements',
      methodProperties: {
        CityName: query,
        Limit: 20,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-member-access
    return data.data[0]?.Addresses ?? [];
  }
  async getWarehouses(cityRef: string, query?: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data } = await axios.post(this.baseUrl, {
      apiKey: this.apiKey,
      modelName: 'Address',
      calledMethod: 'getWarehouses',
      methodProperties: {
        CityRef: cityRef,
        FindByString: query || '',
        Limit: 20,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-member-access
    return data.data;
  }
}
