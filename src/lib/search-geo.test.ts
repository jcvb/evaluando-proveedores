import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { locationTokenMatch, providerMatchesLocationFilters } from "@/lib/search-geo";

const xaltipaProvider = {
  primaryState: "México",
  primaryCity: "Cuautitlán",
  googleFormattedAddress: "Xaltipa, Cuautitlán, Estado de México",
  reviewLocations: [] as Array<{
    state: string;
    cityOrMunicipality: string;
    colonia: string;
    fraccionamiento: string | null;
  }>,
};

describe("locationTokenMatch", () => {
  it("iguala con acentos y mayúsculas distintas", () => {
    assert.equal(locationTokenMatch("Cuautitlán", "cuautitlan"), true);
    assert.equal(locationTokenMatch("México", "Mexico"), true);
  });

  it("acepta contención parcial (Cuautitlán vs Cuautitlán Izcalli)", () => {
    assert.equal(locationTokenMatch("Cuautitlán", "Cuautitlán Izcalli"), true);
    assert.equal(locationTokenMatch("Cuautitlán Izcalli", "Cuautitlán"), true);
  });
});

describe("providerMatchesLocationFilters — escenario CP Xaltipa / Cuautitlán", () => {
  it("encuentra proveedor sin reseñas solo con estado + municipio (CP prellenado)", () => {
    assert.equal(
      providerMatchesLocationFilters(xaltipaProvider, {
        estado: "México",
        municipio: "Cuautitlán",
      }),
      true,
    );
  });

  it("encuentra proveedor sin reseñas con colonia Xaltipa", () => {
    assert.equal(
      providerMatchesLocationFilters(xaltipaProvider, {
        estado: "México",
        municipio: "Cuautitlán",
        colonia: "Xaltipa",
      }),
      true,
    );
  });

  it("NO exige reseñas: el fallo anterior (solo reviews.some) queda cubierto", () => {
    assert.equal(xaltipaProvider.reviewLocations.length, 0);
    assert.equal(
      providerMatchesLocationFilters(xaltipaProvider, {
        municipio: "Cuautitlán",
        colonia: "Xaltipa",
      }),
      true,
    );
  });

  it("excluye otra colonia del mismo municipio", () => {
    assert.equal(
      providerMatchesLocationFilters(xaltipaProvider, {
        estado: "México",
        municipio: "Cuautitlán",
        colonia: "Dos Ríos Primera Sección",
      }),
      false,
    );
  });

  it("excluye otro estado/municipio", () => {
    assert.equal(
      providerMatchesLocationFilters(xaltipaProvider, {
        estado: "Jalisco",
        municipio: "Guadalajara",
      }),
      false,
    );
  });

  it("también encuentra por ubicación de una reseña", () => {
    const withReview = {
      ...xaltipaProvider,
      primaryCity: "Otro",
      googleFormattedAddress: null,
      reviewLocations: [
        {
          state: "México",
          cityOrMunicipality: "Cuautitlán",
          colonia: "Xaltipa",
          fraccionamiento: null,
        },
      ],
    };
    assert.equal(
      providerMatchesLocationFilters(withReview, {
        estado: "México",
        municipio: "Cuautitlán",
        colonia: "Xaltipa",
      }),
      true,
    );
  });
});
