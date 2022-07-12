/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import {toHaveClass} from "@testing-library/jest-dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon).toHaveClass('active-icon')
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    test("Then click on eye icon should shows the modal", async () => {
      $.fn.modal = jest.fn()
      document.body.innerHTML = BillsUI({data: bills})
      await waitFor(() => screen.getAllByTestId('icon-eye'))
      Object.defineProperty(window, "localStorage", { value: { getItem: jest.fn(() => null), setItem: jest.fn(() => null) } },
      )
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ data: [], pathname });
        console.log(pathname)
      };
      const firebase = jest.fn()
      
      const bill = new Bills({ document, onNavigate, firebase, localStorage: window.localStorage })
      const handleClickIconEye = jest.fn(bill.handleClickIconEye);
      const iconEyes = screen.getAllByTestId('icon-eye')
      const iconEye = iconEyes[0]
      iconEye.addEventListener("click", handleClickIconEye(iconEye))
      userEvent.click(iconEye)
      await waitFor(() => screen.getByText('Justificatif'))
      const modal = screen.getByText('Justificatif')
      expect(modal).toBeDefined()
      expect(handleClickIconEye).toHaveBeenCalled()

      /* expect("la fonciton d'affichage de modale doit etre appellee")
      await waitFor('le titre de la modale saffiche)
      expect('le titre de la modale est justificatif') */
    })
  })
})