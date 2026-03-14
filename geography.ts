
export interface GeographicDivision {
  [divisionName: string]: {
    [cityName: string]: string[];
  };
}

export interface CountryData {
  divisionType: 'State' | 'Province' | 'Region' | 'Emirate' | 'Canton' | 'Department' | 'Oblast' | 'Prefecture' | 'None';
  explanation?: string; // For unitary states
  divisions: GeographicDivision;
}

export const GLOBAL_GEOGRAPHY_DB: Record<string, CountryData> = {
  "South Africa": {
    divisionType: 'Province',
    divisions: {
      "Gauteng": {
        "Pretoria": ["Erasmuskloof", "Centurion", "Brooklyn", "Hatfield", "Garsfontein", "Waterkloof", "Moreleta Park"],
        "Johannesburg": ["Sandton", "Randburg", "Midrand", "Rosebank", "Bryanston", "Soweto", "Fourways"],
        "Ekuhuleni": ["Kempton Park", "Boksburg", "Benoni", "Bedfordview"]
      },
      "Western Cape": {
        "Cape Town": ["City Bowl", "Bellville", "Somerset West", "Stellenbosch", "Claremont", "Constantia", "Durbanville"],
        "George": ["Wilderness", "Victoria Bay", "Pacaltsdorp"],
        "Paarl": ["Wellington", "Franschhoek"]
      },
      "KwaZulu-Natal": {
        "Durban": ["Umhlanga", "Berea", "Westville", "Ballito", "Amanzimtoti"],
        "Pietermaritzburg": ["Hilton", "Howick"]
      }
    }
  },
  "United States": {
    divisionType: 'State',
    divisions: {
      "California": {
        "Los Angeles": ["Santa Monica", "Beverly Hills", "Hollywood", "Venice", "Pasadena", "Culver City"],
        "San Francisco": ["SoMa", "Mission District", "Marina", "Nob Hill", "Richmond"],
        "San Diego": ["La Jolla", "Gaslamp Quarter", "Pacific Beach"]
      },
      "New York": {
        "New York City": ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"],
        "Albany": ["Center Square", "Pine Hills"]
      },
      "Texas": {
        "Houston": ["The Woodlands", "Sugar Land", "Katy", "Memorial", "Downtown"],
        "Austin": ["Round Rock", "Cedar Park", "Downtown", "South Congress"]
      }
    }
  },
  "Canada": {
    divisionType: 'Province',
    divisions: {
      "Ontario": {
        "Toronto": ["Downtown", "North York", "Scarborough", "Etobicoke"],
        "Ottawa": ["Kanata", "Orleans", "Nepean"]
      },
      "British Columbia": {
        "Vancouver": ["Kitsilano", "Richmond", "Burnaby", "Surrey"]
      }
    }
  },
  "United Kingdom": {
    divisionType: 'Region',
    divisions: {
      "England": {
        "London": ["City of London", "Westminster", "Camden", "Greenwich", "Hackney", "Islington", "Kensington"],
        "Manchester": ["Salford", "Trafford", "Stockport", "Didsbury", "Altrincham"],
        "Birmingham": ["Edgbaston", "Solihull", "Sutton Coldfield"]
      },
      "Scotland": {
        "Edinburgh": ["Leith", "Old Town", "New Town", "Morningside"],
        "Glasgow": ["West End", "City Centre", "South Side", "Bearsden"]
      }
    }
  },
  "Australia": {
    divisionType: 'State',
    divisions: {
      "New South Wales": {
        "Sydney": ["Surry Hills", "Bondi", "Parramatta", "Chatswood", "North Sydney"]
      },
      "Victoria": {
        "Melbourne": ["Southbank", "Richmond", "St Kilda", "Brunswick"]
      }
    }
  },
  "United Arab Emirates": {
    divisionType: 'Emirate',
    divisions: {
      "Dubai": {
        "Dubai City": ["Downtown Dubai", "Dubai Marina", "Palm Jumeirah", "Business Bay", "JLT", "Discovery Gardens"]
      },
      "Abu Dhabi": {
        "Abu Dhabi City": ["Yas Island", "Saadiyat Island", "Al Reem Island", "Khalifa City"]
      }
    }
  },
  "Singapore": {
    divisionType: 'None',
    explanation: "Singapore is a unitary city-state. It does not have states or provinces; administrative divisions are used for local planning only.",
    divisions: {
      "Singapore City": {
        "Central": ["Orchard", "Marina Bay", "Tanjong Pagar", "Raffles Place"],
        "East": ["Changi", "Tampines", "Bedok", "Pasir Ris"],
        "West": ["Jurong East", "Clementi", "Boon Lay", "Tuas"]
      }
    }
  },
  "France": {
    divisionType: 'Department',
    divisions: {
      "Paris": {
        "Paris City": ["1st Arrondissement", "8th Arrondissement", "16th Arrondissement", "Marais"]
      },
      "Rhône": {
        "Lyon": ["Villeurbanne", "Ecully", "Limonest"]
      }
    }
  },
  "Japan": {
    divisionType: 'Prefecture',
    divisions: {
      "Tokyo": {
        "Special Wards": ["Shinjuku", "Shibuya", "Minato", "Chiyoda", "Chuo"]
      },
      "Osaka": {
        "Osaka City": ["Umeda", "Namba", "Tennoji"]
      }
    }
  },
  "Germany": {
    divisionType: 'State',
    divisions: {
      "Bavaria": {
        "Munich": ["Altstadt", "Maxvorstadt", "Schwabing", "Bogenhausen"],
        "Nuremberg": ["Mitte", "Südstadt"]
      },
      "Berlin": {
        "Berlin City": ["Mitte", "Kreuzberg", "Charlottenburg", "Prenzlauer Berg", "Neukölln"]
      }
    }
  }
};
