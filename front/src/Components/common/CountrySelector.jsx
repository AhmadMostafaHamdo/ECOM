import React, { useState } from 'react';
import { useLocalize } from '../context/LocalizeContext';
import { Menu, MenuItem, Button, Tooltip } from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const CountrySelector = () => {
  const { activeCountry, changeCountry, COUNTRIES } = useLocalize();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (countryId) => {
    changeCountry(countryId);
    handleClose();
  };

  return (
    <div className="country-selector-wrapper">
      <Tooltip title="Select Region / العملة والدولة">
        <Button
          onClick={handleClick}
          startIcon={<PublicIcon style={{ fontSize: 18 }} />}
          endIcon={<ExpandMoreIcon />}
          style={{
            color: 'var(--text-color, #333)',
            textTransform: 'none',
            fontSize: '0.85rem',
            padding: '4px 12px',
            borderRadius: '20px',
            background: 'var(--bg-secondary, rgba(0,0,0,0.05))',
            fontWeight: 500,
            margin: '0 8px'
          }}
        >
          {activeCountry.name.length > 15 ? activeCountry.id.toUpperCase() : activeCountry.name}
          <span style={{ marginLeft: '6px', fontSize: '0.75rem', opacity: 0.7 }}>
            ({activeCountry.currency})
          </span>
        </Button>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            marginTop: '8px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            minWidth: '220px'
          }
        }}
      >
        <div style={{ padding: '8px 16px', fontSize: '0.75rem', fontWeight: 700, opacity: 0.5, textTransform: 'uppercase' }}>
          Select Delivery Region
        </div>
        {COUNTRIES.map((country) => (
          <MenuItem
            key={country.id}
            onClick={() => handleSelect(country.id)}
            selected={activeCountry.id === country.id}
            style={{
              padding: '10px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <span style={{ fontWeight: activeCountry.id === country.id ? 700 : 400 }}>
                {country.name}
              </span>
              <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                Currency: {country.currency} | {country.code}
              </div>
            </div>
            {activeCountry.id === country.id && (
              <CheckCircleIcon color="primary" style={{ fontSize: 18 }} />
            )}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default CountrySelector;
