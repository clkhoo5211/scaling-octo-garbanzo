import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("should render when isOpen is true", () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} title="Test Modal">
        Modal content
      </Modal>
    );
    expect(screen.getByText("Test Modal")).toBeInTheDocument();
    expect(screen.getByText("Modal content")).toBeInTheDocument();
  });

  it("should not render when isOpen is false", () => {
    render(
      <Modal isOpen={false} onClose={jest.fn()} title="Test Modal">
        Modal content
      </Modal>
    );
    expect(screen.queryByText("Test Modal")).not.toBeInTheDocument();
  });

  it("should call onClose when close button is clicked", () => {
    const handleClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        Content
      </Modal>
    );

    const closeButton = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when backdrop is clicked", () => {
    const handleClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        Content
      </Modal>
    );

    const backdrop = screen.getByRole("dialog").parentElement;
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(handleClose).toHaveBeenCalled();
    }
  });

  it("should apply size classes correctly", () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={jest.fn()} title="Test" size="sm">
        Content
      </Modal>
    );
    expect(screen.getByRole("dialog")).toHaveClass("max-w-md");

    rerender(
      <Modal isOpen={true} onClose={jest.fn()} title="Test" size="lg">
        Content
      </Modal>
    );
    expect(screen.getByRole("dialog")).toHaveClass("max-w-2xl");
  });

  it("should not show close button when showCloseButton is false", () => {
    render(
      <Modal
        isOpen={true}
        onClose={jest.fn()}
        title="Test"
        showCloseButton={false}
      >
        Content
      </Modal>
    );
    expect(
      screen.queryByRole("button", { name: /close/i })
    ).not.toBeInTheDocument();
  });

  it("should handle Escape key to close", () => {
    const handleClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test">
        Content
      </Modal>
    );

    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });
    expect(handleClose).toHaveBeenCalled();
  });
});
