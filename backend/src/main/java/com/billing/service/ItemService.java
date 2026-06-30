package com.billing.service;

import com.billing.dto.ItemDTO;
import com.billing.entity.*;
import com.billing.exception.*;
import com.billing.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ItemService {
    private final ItemRepository itemRepository;
    private final CategoryRepository categoryRepository;
    private final ItemSequenceRepository itemSequenceRepository;
    private final CompanyRepository companyRepository;

    @Transactional
    public ItemDTO.Response createItem(ItemDTO.CreateRequest request, Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", companyId));

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));
        }

        String itemCode = generateItemCode(companyId);

        Item item = Item.builder()
                .itemCode(itemCode)
                .name(request.getName())
                .description(request.getDescription())
                .category(category)
                .purchasePrice(request.getPurchasePrice())
                .sellingPrice(request.getSellingPrice())
                .quantity(request.getQuantity())
                .unit(request.getUnit() != null ? request.getUnit() : Item.Unit.PIECE)
                .taxPercentage(request.getTaxPercentage())
                .minStockThreshold(request.getMinStockThreshold())
                .company(company)
                .isActive(true)
                .dateAdded(LocalDate.now())
                .build();

        return toResponse(itemRepository.save(item));
    }

    @Transactional
    public ItemDTO.Response updateItem(Long id, ItemDTO.UpdateRequest request, Long companyId) {
        Item item = getItemByIdAndCompany(id, companyId);

        if (request.getName() != null) item.setName(request.getName());
        if (request.getDescription() != null) item.setDescription(request.getDescription());
        if (request.getCategoryId() != null) {
            item.setCategory(categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId())));
        }
        if (request.getPurchasePrice() != null) item.setPurchasePrice(request.getPurchasePrice());
        if (request.getSellingPrice() != null) item.setSellingPrice(request.getSellingPrice());
        if (request.getQuantity() != null) item.setQuantity(request.getQuantity());
        if (request.getUnit() != null) item.setUnit(request.getUnit());
        if (request.getTaxPercentage() != null) item.setTaxPercentage(request.getTaxPercentage());
        if (request.getMinStockThreshold() != null) item.setMinStockThreshold(request.getMinStockThreshold());
        if (request.getIsActive() != null) item.setIsActive(request.getIsActive());

        return toResponse(itemRepository.save(item));
    }

    @Transactional
    public void deleteItem(Long id, Long companyId) {
        Item item = getItemByIdAndCompany(id, companyId);
        item.setIsActive(false);
        itemRepository.save(item);
    }

    @Transactional(readOnly = true)
    public Page<ItemDTO.Response> getItems(Long companyId, String search, Long categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Item> items = itemRepository.searchItems(companyId, search, pageable);
        return items.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ItemDTO.Response getItem(Long id, Long companyId) {
        return toResponse(getItemByIdAndCompany(id, companyId));
    }

    @Transactional(readOnly = true)
    public List<ItemDTO.Response> getLowStockItems(Long companyId) {
        return itemRepository.findLowStockItems(companyId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ItemDTO.SearchResult> searchForBilling(Long companyId, String q) {
        return itemRepository.searchForBilling(companyId, q).stream()
                .map(this::toSearchResult).collect(Collectors.toList());
    }

    private String generateItemCode(Long companyId) {
        ItemSequence seq = itemSequenceRepository.findByCompanyIdForUpdate(companyId)
                .orElseThrow(() -> new BusinessException("Item sequence not found for company"));
        long next = seq.getLastSequence() + 1;
        seq.setLastSequence(next);
        itemSequenceRepository.save(seq);
        return String.format("ITM%06d", next);
    }

    private Item getItemByIdAndCompany(Long id, Long companyId) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item", id));
        if (!item.getCompany().getId().equals(companyId)) {
            throw new ResourceNotFoundException("Item", id);
        }
        return item;
    }

    public ItemDTO.Response toResponse(Item item) {
        return ItemDTO.Response.builder()
                .id(item.getId())
                .itemCode(item.getItemCode())
                .name(item.getName())
                .description(item.getDescription())
                .categoryId(item.getCategory() != null ? item.getCategory().getId() : null)
                .categoryName(item.getCategory() != null ? item.getCategory().getName() : null)
                .purchasePrice(item.getPurchasePrice())
                .sellingPrice(item.getSellingPrice())
                .quantity(item.getQuantity())
                .unit(item.getUnit() != null ? item.getUnit().name() : null)
                .taxPercentage(item.getTaxPercentage())
                .minStockThreshold(item.getMinStockThreshold())
                .isActive(item.getIsActive())
                .isLowStock(item.isLowStock())
                .dateAdded(item.getDateAdded() != null ? item.getDateAdded().toString() : null)
                .createdAt(item.getCreatedAt() != null ? item.getCreatedAt().toString() : null)
                .build();
    }

    private ItemDTO.SearchResult toSearchResult(Item item) {
        return ItemDTO.SearchResult.builder()
                .id(item.getId())
                .itemCode(item.getItemCode())
                .name(item.getName())
                .sellingPrice(item.getSellingPrice())
                .quantity(item.getQuantity())
                .unit(item.getUnit() != null ? item.getUnit().name() : null)
                .taxPercentage(item.getTaxPercentage())
                .isLowStock(item.isLowStock())
                .build();
    }
}
