"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CircleCheck, LoaderCircle, TriangleAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MEXICAN_STATES } from "@/lib/constants";
import { lookupPostalCodeAction, suggestFraccionamientosAction } from "@/server/actions/discovery";

export type AddressValue = {
  postalCode: string;
  state: string;
  municipio: string;
  ciudad: string;
  colonia: string;
  fraccionamiento: string;
  calle: string;
};

type Props = {
  value: AddressValue;
  onChange: (next: AddressValue) => void;
  errors?: Partial<Record<"postalCode" | "state" | "municipio" | "colonia" | "calle", string>>;
  requireColonia?: boolean;
  showCalle?: boolean;
  nativeNames?: boolean;
};

const empty: AddressValue = {
  postalCode: "",
  state: "",
  municipio: "",
  ciudad: "",
  colonia: "",
  fraccionamiento: "",
  calle: "",
};

export function emptyAddress(partial?: Partial<AddressValue>): AddressValue {
  return { ...empty, ...partial };
}

export function AddressFields({
  value,
  onChange,
  errors = {},
  requireColonia = true,
  showCalle = true,
  nativeNames = false,
}: Props) {
  const listId = useId();
  const valueRef = useRef(value);
  valueRef.current = value;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [colonias, setColonias] = useState<{ nombre: string; tipo: string }[]>([]);
  const [zoneHints, setZoneHints] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "empty" | "error">("idle");
  const [fromCatalog, setFromCatalog] = useState(false);

  function patch(partial: Partial<AddressValue>) {
    onChange({ ...valueRef.current, ...partial });
  }

  useEffect(() => {
    const cp = value.postalCode;
    if (!/^\d{5}$/.test(cp)) {
      setStatus(cp.length === 0 ? "idle" : "idle");
      setColonias([]);
      setFromCatalog(false);
      return;
    }

    let cancelled = false;
    setStatus("loading");
    const handle = window.setTimeout(() => {
      void lookupPostalCodeAction(cp)
        .then((result) => {
          if (cancelled) return;
          if (!result) {
            setColonias([]);
            setFromCatalog(false);
            setStatus("empty");
            return;
          }
          const current = valueRef.current;
          const keepCurrentColonia = result.asentamientos.some((item) => item.nombre === current.colonia);
          // En búsqueda (colonia opcional) no forzar la primera colonia del CP:
          // eso ocultaba proveedores de otras colonias del mismo municipio (p. ej. Xaltipa).
          const nextColonia = keepCurrentColonia
            ? current.colonia
            : requireColonia
              ? (result.asentamientos[0]?.nombre ?? "")
              : "";
          setColonias(result.asentamientos);
          setFromCatalog(true);
          setStatus("ok");
          onChangeRef.current({
            ...current,
            postalCode: cp,
            state: result.estado,
            municipio: result.municipio,
            ciudad: result.ciudad ?? "",
            colonia: nextColonia,
          });
        })
        .catch(() => {
          if (!cancelled) {
            setStatus("error");
            setFromCatalog(false);
          }
        });
    }, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [value.postalCode, requireColonia]);

  useEffect(() => {
    const q = value.fraccionamiento.trim();
    if (q.length < 2) {
      setZoneHints([]);
      return;
    }
    const handle = window.setTimeout(() => {
      void suggestFraccionamientosAction({
        q,
        estado: value.state,
        municipio: value.municipio,
        colonia: value.colonia,
      }).then(setZoneHints);
    }, 250);
    return () => window.clearTimeout(handle);
  }, [value.fraccionamiento, value.state, value.municipio, value.colonia]);

  function onPostalChange(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 5);
    if (digits.length < 5) {
      setColonias([]);
      setFromCatalog(false);
      setStatus("idle");
      onChange({
        ...valueRef.current,
        postalCode: digits,
        state: "",
        municipio: "",
        ciudad: "",
        colonia: "",
      });
      return;
    }
    patch({ postalCode: digits });
  }

  const selectClass = "control mt-1.5";
  const fieldClass = "mt-1.5";
  const readyForDetail = Boolean(value.state && value.municipio) || status === "empty";

  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label htmlFor="address-cp">Código postal</Label>
          <Input
            id="address-cp"
            inputMode="numeric"
            maxLength={5}
            autoComplete="postal-code"
            placeholder="5 dígitos"
            value={value.postalCode}
            onChange={(event) => onPostalChange(event.target.value)}
            className={fieldClass}
          />
          {status === "loading" ? (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <LoaderCircle className="size-3.5 animate-spin" aria-hidden />
              Buscando ubicación…
            </p>
          ) : null}
          {status === "ok" ? (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-primary">
              <CircleCheck className="size-3.5" aria-hidden />
              Ubicación cargada
            </p>
          ) : null}
          {status === "empty" ? (
            <p className="mt-1 flex items-start gap-1.5 text-sm text-amber-800">
              <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              Ese CP no está en el catálogo. Revisa los dígitos o llena el resto a mano.
            </p>
          ) : null}
          {status === "error" ? (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-destructive">
              <TriangleAlert className="size-3.5" aria-hidden />
              No se pudo consultar el CP.
            </p>
          ) : null}
          {errors.postalCode ? <p className="mt-1 text-sm text-destructive">{errors.postalCode}</p> : null}
        </div>
        <div>
          <Label htmlFor="address-state">Estado</Label>
          {fromCatalog ? (
            <>
              <Input id="address-state" value={value.state} readOnly className={`${fieldClass} bg-muted`} />
              {nativeNames ? <input type="hidden" name="estado" value={value.state} /> : null}
            </>
          ) : (
            <select
              id="address-state"
              name={nativeNames ? "estado" : undefined}
              value={value.state}
              onChange={(event) => patch({ state: event.target.value })}
              className={selectClass}
              disabled={value.postalCode.length > 0 && value.postalCode.length < 5}
            >
              <option value="">Elige</option>
              {MEXICAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          )}
          {errors.state ? <p className="mt-1 text-sm text-destructive">{errors.state}</p> : null}
        </div>
        <div>
          <Label htmlFor="address-municipio">Municipio o alcaldía</Label>
          <Input
            id="address-municipio"
            name={nativeNames ? "municipio" : undefined}
            value={value.municipio}
            readOnly={fromCatalog}
            onChange={(event) => patch({ municipio: event.target.value })}
            className={`${fieldClass} ${fromCatalog ? "bg-muted" : ""}`}
            disabled={!fromCatalog && value.postalCode.length > 0 && value.postalCode.length < 5}
          />
          {errors.municipio ? <p className="mt-1 text-sm text-destructive">{errors.municipio}</p> : null}
        </div>
        <div>
          <Label htmlFor="address-ciudad">Ciudad</Label>
          <Input
            id="address-ciudad"
            value={value.ciudad}
            readOnly={fromCatalog && Boolean(value.ciudad)}
            onChange={(event) => patch({ ciudad: event.target.value })}
            className={`${fieldClass} ${fromCatalog && value.ciudad ? "bg-muted" : ""}`}
            placeholder="Si aplica"
            disabled={!readyForDetail}
          />
        </div>
      </div>

      <div className={`grid gap-3 ${showCalle ? "md:grid-cols-2" : ""}`}>
        <div>
          <Label htmlFor="address-colonia">Colonia{requireColonia ? "" : " (opcional)"}</Label>
          {colonias.length > 0 ? (
            <select
              id="address-colonia"
              name={nativeNames ? "colonia" : undefined}
              value={value.colonia}
              onChange={(event) => patch({ colonia: event.target.value })}
              className={selectClass}
            >
              <option value="">Elige la colonia</option>
              {colonias.map((item) => (
                <option key={`${item.tipo}-${item.nombre}`} value={item.nombre}>
                  {item.nombre} ({item.tipo})
                </option>
              ))}
            </select>
          ) : (
            <Input
              id="address-colonia"
              name={nativeNames ? "colonia" : undefined}
              value={value.colonia}
              onChange={(event) => patch({ colonia: event.target.value })}
              className={fieldClass}
              placeholder={readyForDetail ? "Escribe la colonia" : "Primero el código postal"}
              disabled={!readyForDetail}
            />
          )}
          {errors.colonia ? <p className="mt-1 text-sm text-destructive">{errors.colonia}</p> : null}
        </div>
        {showCalle ? (
          <div>
            <Label htmlFor="address-calle">Calle y número</Label>
            <Input
              id="address-calle"
              value={value.calle}
              onChange={(event) => patch({ calle: event.target.value })}
              className={fieldClass}
              placeholder="Ej. Av. Universidad 120"
              disabled={!value.colonia}
            />
            {errors.calle ? <p className="mt-1 text-sm text-destructive">{errors.calle}</p> : null}
          </div>
        ) : null}
      </div>

      <div>
        <Label htmlFor="address-fracc">Fraccionamiento, privada o coto</Label>
        <Input
          id="address-fracc"
          name={nativeNames ? "fraccionamiento" : undefined}
          value={value.fraccionamiento}
          onChange={(event) => patch({ fraccionamiento: event.target.value })}
          list={listId}
          className={fieldClass}
          placeholder="Opcional"
          disabled={!value.colonia && colonias.length > 0}
        />
        <datalist id={listId}>
          {zoneHints.map((hint) => (
            <option key={hint} value={hint} />
          ))}
        </datalist>
      </div>
    </div>
  );
}
