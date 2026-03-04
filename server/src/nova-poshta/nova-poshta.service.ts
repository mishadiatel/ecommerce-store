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
        CityName: query.trim() || undefined,
        Limit: 20,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
    return (data.data[0]?.Addresses ?? []).map(
      (city: { DeliveryCity: string; Present: string }) => ({
        value: city.DeliveryCity,
        label: city.Present,
      }),
    );
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
    return data.data.map((w: { Description: string; Ref: string }) => ({
      label: w.Description,
      value: w.Ref,
    }));
  }
}
