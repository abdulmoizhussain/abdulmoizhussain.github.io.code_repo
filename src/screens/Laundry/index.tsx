import { useEffect, useState } from 'react';
// import BigNumber from "bignumber.js";
import "./index.css";

function App() {
  const [_textArea, setTextArea] = useState("");
  const [_keysOnly, setKeysOnly] = useState<ClotheTypeKey[]>([]);
  const [_allClothesAndCount, setAllClothesAndCount] = useState<ClotheTypeAndCount[]>([]);
  const [_individualDetails, setIndividualDetails] = useState<string[]>([]);
  const [_totalObject, setTotalObject] = useState({
    totalAmountToPay: 0,
    totalClothes: 0,
    totalRows: 0,
  });

  useEffect(() => {
    const typeAndRates = localStorage.getItem("ClotheTypeAndRates");
    const typeAndRatesArray = typeAndRates ? JSON.parse(typeAndRates) : null;
    if (typeAndRatesArray && Array.isArray(typeAndRatesArray)) {
      setKeysOnly(typeAndRatesArray);
    }
  }, []);

  function onConfirmRates(_ev: React.MouseEvent<HTMLButtonElement>) {
    const splitText = _textArea.split("\n");

    const allClothesAndCount: ClotheTypeAndCount[] = [];
    splitText.forEach(val => {
      const result = /^([0-9]+)x\s(.+)$/.exec(val);
      if (result) {
        const count = parseFloat(result[1]);
        const clotheType = result[2];
        const obj: ClotheTypeAndCount = { clotheType, count, rowTotal: 0, rate: 0, thisRowAmount: 0 };
        allClothesAndCount.push(obj);
      }
    });
    console.log("total rows at the time of parsing:", allClothesAndCount.length);

    const keysOnly = [..._keysOnly];
    new Set(allClothesAndCount.map(x => x.clotheType).sort()).forEach((value, index) => {
      const key = `key-${index}`;
      const obj: ClotheTypeKey = {
        key,
        clotheType: value,
        rate: "",
      };

      if (!keysOnly.find(x => x.clotheType === value)) {
        keysOnly.push(obj);
      }
    });

    setAllClothesAndCount([...allClothesAndCount]);
    keysOnly.length !== _keysOnly.length && setKeysOnly(keysOnly);
  }

  function handleRateChange(ev: React.ChangeEvent<HTMLInputElement>, index: number) {
    _keysOnly[index].rate = ev.target.value;
    const newState = [..._keysOnly];
    setKeysOnly(newState);

    localStorage.setItem("ClotheTypeAndRates", JSON.stringify(newState));
  }

  function onCalculateTotal(_ev: React.MouseEvent<HTMLElement>) {
    console.log("total rows at the time of total:", _allClothesAndCount.length);
    const allClothesAndCount = [..._allClothesAndCount];
    let totalPayable = 0;
    let totalClothes = 0;
    let totalRows = 0;

    const individualDetails: ClotheTypeAndCount[] = [];

    for (const singleRow of allClothesAndCount) {
      const keyOnly = _keysOnly.find(x => x.clotheType === singleRow.clotheType);
      if (keyOnly) {
        // const clothesInThisRow = parseFloat(singleRow.count);
        const clothesInThisRow = singleRow.count;
        const rate = parseFloat(keyOnly.rate);
        const amountOfSingleRow = clothesInThisRow * rate;
        singleRow.rate = rate;
        singleRow.thisRowAmount = amountOfSingleRow;

        totalClothes += clothesInThisRow;
        totalPayable += amountOfSingleRow;
        totalRows++;

        let indDetail: ClotheTypeAndCount | undefined = individualDetails.find(x => x.clotheType === singleRow.clotheType);
        if (indDetail) {
          indDetail.count += clothesInThisRow;
          indDetail.thisRowAmount += amountOfSingleRow;
        } else {
          indDetail = {
            clotheType: singleRow.clotheType,
            rate: rate,
            count: clothesInThisRow,
            thisRowAmount: amountOfSingleRow,
            rowTotal: 0,
          };
          individualDetails.push(indDetail);
        }
      }
    }

    setTotalObject({
      totalAmountToPay: totalPayable,
      totalClothes: totalClothes,
      totalRows: totalRows,
    });
    setIndividualDetails(individualDetails.map(x => `${x.clotheType} [${x.count}x${x.rate}]->${x.thisRowAmount}`));
  }

  return (
    <>
      <div>
        <textarea
          id='clothes-textarea'
          // rows={30}
          cols={100}
          onChange={x => setTextArea(x.target.value)}
          value={_textArea}
        />
        <br />
        <button onClick={onConfirmRates}>Confirm Rates</button>
        <br />
        <br />
        {_keysOnly.map((val, index) => {
          return <div key={val.key}>
            <label htmlFor={val.key}>{val.clotheType}</label> <input id={val.key} type='number' value={val.rate} onChange={ev => handleRateChange(ev, index)} /> rs
          </div>;
        })}
        {_keysOnly.length && <button onClick={onCalculateTotal}>Calculate Total</button>}
        {_keysOnly.length && <div>
          <b>{"Total Payment->"} {_totalObject.totalAmountToPay}</b> <br />
          {"Total rows->"} {_totalObject.totalRows} <br />
          {"Total clothes->"} {_totalObject.totalClothes} <br />
          {_individualDetails.length && <>
            <br />{"Details->"}<br />
            {_individualDetails.map((val, index) => <div key={index}>{val}</div>)}
          </>}

        </div>}

      </div>
    </>
  );
}

export default App;

interface ClotheTypeAndCount {
  clotheType: string;
  rate: number;
  count: number;
  thisRowAmount: number;
  rowTotal: number;
}

interface ClotheTypeKey {
  key: string;
  clotheType: string;
  rate: string;
}