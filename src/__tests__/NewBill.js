/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import mockedBills from "../__mocks__/store.js"
import localStorageMocked from "../__mocks__/localStorage.js"
import { ROUTES } from "../constants/routes.js";
import userEvent from '@testing-library/user-event'
import { fireEvent } from "@testing-library/dom"

const html = NewBillUI()
document.body.innerHTML = html

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ data: [], pathname });
};

const newBill = new NewBill({ document, onNavigate, store: mockedBills, localStorageMocked })

window.localStorage.setItem('user', JSON.stringify({
  type: 'Employee',
  email:"e@e"
}))

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {

    test("Then I am on the right page", () => {
      expect(NewBill).toBeTruthy()
    })

    test("Then i load a .txt file", () => {
      const input = document.querySelector('input[data-testid="file"]')
      const file = new File(['text'], 'text.txt', { type: 'text/plain' })
      userEvent.upload(input, file)

      expect(input.files).toBeNull()

    })
  })

  //new tests
  describe("When the image format is accepted", () => {
    test('Then the change file fuction is called', () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ data: [], pathname });
      };
      const newFile = new File([""], "test.jpg", { type: "image/jpg" })
      window.localStorage.setItem('ext', "jpg")

      const newBill = new NewBill({ document, onNavigate, store: mockedBills, localStorage })
      const changeFile = jest.fn(newBill.handleChangeFile)
      const file = screen.getByTestId("file")

      file.addEventListener("change", changeFile)
      fireEvent.change(file, {
        target: {
          files: [newFile]
        }
      })

      expect(changeFile).toHaveBeenCalled()
      expect(file.files.length).toEqual(1)
    })


  })
  describe("When I click on submit button of the form", () => {
    test('It should create a new bill', () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const formData = new FormData()
      formData.append('file', 'yes')
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      window.localStorage.setItem('formData', formData)
      const html = NewBillUI()
      document.body.innerHTML = html
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockedBills,
        localStorage: window.localStorage,
      });
      const file = screen.getByTestId("file")
      fireEvent.change(file, {
        target: {
          files: [new File(["test.png"], "test.png", { type: "image/png" })]
        }
      })
      const handleSubmit = jest.fn(() => newBill.handleSubmit)
      const newBillform = screen.getByTestId("form-new-bill")
      newBillform.addEventListener('submit', handleSubmit)
      fireEvent.submit(newBillform)
      expect(handleSubmit).toHaveBeenCalled()
    })
  })
})
