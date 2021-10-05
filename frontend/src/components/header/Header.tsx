import { ChangeEvent, useEffect, useState } from 'react';
import { BranchContext } from '../main/Main';
import { Branch } from '../types';
import logo from './../../logo.svg';
import './Header.css';

interface Props {
  onBranchChange: (b: Branch) => void;
}

function Header(props: Props) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const {onBranchChange: cb} = props;

  useEffect(() => {
    fetch('/api/branches', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(r => r.json())
      .then((branches: Branch[]) => {
        setBranches(branches);
        cb(branches[0]);
      });
  }, [cb]);

  const onBranchChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const branch = branches.find(b => b.accountAddress === e.target.value);
    props.onBranchChange(branch || {} as Branch);
  }

  return (
    <header className="Header">
      <div className="Header-Container">
        <div className="Header-Logo">
          <img src={logo} alt="logo"/>
        </div>
        <div className="Header-Title">
          <BranchContext.Consumer>
            {value => <h1>{value ? value.name : ''}</h1>}
          </BranchContext.Consumer>
        </div>
        <div className="Header-Toggle">
          <label htmlFor="branch-picker">Branch:</label>
          <select id="branch-picker" onChange={onBranchChange}>
            { branches.map(b => <option key={b.accountAddress} value={b.accountAddress}>{b.name}</option>)}
          </select>
        </div>
      </div>
    </header>
  );
}

export default Header;
